import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import WorkerPerformanceReview from '../models/WorkerPerformanceReview.js';

const isAdminRole = (role) => ['Admin', 'NGO_Manager'].includes(role);

const buildRatingStats = (reviews) => {
  if (!reviews.length) {
    return { averageRating: 0, totalReviews: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
  };
};

/**
 * List field workers for directory (with rating summary)
 */
export const getWorkersDirectory = async (req, res) => {
  try {
    const workers = await User.find({ role: 'Field Worker', isActive: true })
      .select('_id name email createdAt')
      .sort({ name: 1 })
      .lean();

    const workerIds = workers.map((w) => w._id);

    const reviewAgg = await WorkerPerformanceReview.aggregate([
      { $match: { workerId: { $in: workerIds } } },
      {
        $group: {
          _id: '$workerId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map(
      reviewAgg.map((row) => [
        row._id.toString(),
        {
          averageRating: Math.round(row.averageRating * 10) / 10,
          totalReviews: row.totalReviews,
        },
      ])
    );

    const data = workers.map((worker) => ({
      ...worker,
      id: worker._id,
      stats: statsMap.get(worker._id.toString()) || { averageRating: 0, totalReviews: 0 },
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workers directory',
      error: error.message,
    });
  }
};

/**
 * Get worker profile with activity stats and performance reviews
 */
export const getWorkerProfile = async (req, res) => {
  try {
    const { workerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({ success: false, message: 'Invalid worker ID' });
    }

    const worker = await User.findOne({
      _id: workerId,
      role: 'Field Worker',
      isActive: true,
    }).select('_id name email role createdAt lastLogin');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const [submissionCount, eventsAssigned, reviews] = await Promise.all([
      DynamicSubmission.countDocuments({ workerId, status: 'submitted' }),
      Event.countDocuments({ 'assignedWorkers.workerId': workerId }),
      WorkerPerformanceReview.find({ workerId })
        .populate('ratedBy', 'name email role')
        .populate('eventId', 'name status')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const ratingStats = buildRatingStats(reviews);
    const viewerIsAdmin = isAdminRole(req.user.role);
    const viewerId = req.user.id;

    const formattedReviews = reviews.map((review) => ({
      id: review._id,
      rating: review.rating,
      comment: review.comment,
      event: review.eventId
        ? { id: review.eventId._id, name: review.eventId.name, status: review.eventId.status }
        : null,
      ratedBy: {
        id: review.ratedBy._id,
        name: review.ratedBy.name,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      canEdit: viewerIsAdmin && review.ratedBy._id.toString() === viewerId,
    }));

    res.json({
      success: true,
      data: {
        worker: {
          id: worker._id,
          name: worker.name,
          email: worker.email,
          role: worker.role,
          memberSince: worker.createdAt,
          lastLogin: worker.lastLogin,
        },
        activity: {
          submissionsCount: submissionCount,
          eventsAssignedCount: eventsAssigned,
        },
        performance: {
          ...ratingStats,
          reviews: formattedReviews,
        },
        viewer: {
          isAdmin: viewerIsAdmin,
          isOwnProfile: req.user.id.toString() === workerId.toString(),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker profile',
      error: error.message,
    });
  }
};

/**
 * Create performance review (admin only)
 */
export const createPerformanceReview = async (req, res) => {
  try {
    const { workerId, rating, comment, eventId } = req.body;
    const adminId = req.user.id;

    if (!workerId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Worker and rating are required',
      });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const worker = await User.findOne({ _id: workerId, role: 'Field Worker' });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    let event = null;
    if (eventId) {
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ success: false, message: 'Invalid event ID' });
      }
      event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
    }

    const review = await WorkerPerformanceReview.create({
      workerId,
      ratedBy: adminId,
      eventId: eventId || null,
      rating: numericRating,
      comment: comment?.trim() || '',
    });

    const populated = await WorkerPerformanceReview.findById(review._id)
      .populate('ratedBy', 'name email role')
      .populate('eventId', 'name status');

    res.status(201).json({
      success: true,
      message: 'Performance review added',
      data: formatReview(populated, adminId),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this worker for this event',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create performance review',
      error: error.message,
    });
  }
};

/**
 * Update own performance review (admin only)
 */
export const updatePerformanceReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, eventId } = req.body;
    const adminId = req.user.id;

    const review = await WorkerPerformanceReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.ratedBy.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews',
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5',
        });
      }
      review.rating = numericRating;
    }

    if (comment !== undefined) {
      review.comment = comment?.trim() || '';
    }

    if (eventId !== undefined) {
      if (eventId === null || eventId === '') {
        review.eventId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
          return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).json({ success: false, message: 'Event not found' });
        }
        review.eventId = eventId;
      }
    }

    await review.save();

    const populated = await WorkerPerformanceReview.findById(review._id)
      .populate('ratedBy', 'name email role')
      .populate('eventId', 'name status');

    res.json({
      success: true,
      message: 'Performance review updated',
      data: formatReview(populated, adminId),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You already have a rating for this worker on the selected event',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update performance review',
      error: error.message,
    });
  }
};

/**
 * Delete own performance review (admin only)
 */
export const deletePerformanceReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user.id;

    const review = await WorkerPerformanceReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.ratedBy.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    await review.deleteOne();

    res.json({ success: true, message: 'Performance review deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete performance review',
      error: error.message,
    });
  }
};

function formatReview(review, viewerId) {
  return {
    id: review._id,
    rating: review.rating,
    comment: review.comment,
    event: review.eventId
      ? { id: review.eventId._id, name: review.eventId.name, status: review.eventId.status }
      : null,
    ratedBy: {
      id: review.ratedBy._id,
      name: review.ratedBy.name,
    },
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    canEdit: review.ratedBy._id.toString() === viewerId,
  };
}
