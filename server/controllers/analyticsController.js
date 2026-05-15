import mongoose from 'mongoose';
import Event from '../models/Event.js';
import User from '../models/User.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import DynamicDraft from '../models/DynamicDraft.js';
import { getCoordinatesForLocation } from '../utils/geoCoordinates.js';

export const getGlobalHeatmap = async (req, res) => {
  try {
    const stateCityCounts = await DynamicSubmission.aggregate([
      {
        $match: {
          'location.state': { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: {
            state: '$location.state',
            city: '$location.city',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const states = [];
    const points = [];
    const stateMap = new Map();

    for (const item of stateCityCounts) {
      const stateName = item._id.state || 'Unknown';
      const cityName = item._id.city || 'Unknown';
      const count = item.count;

      const stateKey = stateName.trim();
      const stateEntry = stateMap.get(stateKey) || { state: stateKey, stateCount: 0, cities: [] };
      stateEntry.stateCount += count;
      stateEntry.cities.push({ city: cityName, count });
      stateMap.set(stateKey, stateEntry);

      const coord = getCoordinatesForLocation(stateName, cityName);
      if (coord) {
        points.push({
          state: stateKey,
          city: cityName,
          count,
          lat: coord.lat,
          lng: coord.lng,
        });
      }
    }

    for (const entry of stateMap.values()) {
      states.push(entry);
    }

    states.sort((a, b) => b.stateCount - a.stateCount);
    points.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        states,
        points,
        center: { lat: 20.0, lng: 78.0 },
        zoom: 4,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data',
      error: error.message,
    });
  }
};

export const getSubmissionTrends = async (req, res) => {
  try {
    const monthly = await DynamicSubmission.aggregate([
      {
        $match: {
          submittedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$submittedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          period: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    const weekly = await DynamicSubmission.aggregate([
      {
        $match: {
          submittedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%G-%V', date: '$submittedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          period: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data: { monthly, weekly } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission trends',
      error: error.message,
    });
  }
};

export const getEventProgress = async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $lookup: {
          from: 'forms',
          localField: 'forms.formId',
          foreignField: '_id',
          as: 'formList',
        },
      },
      {
        $lookup: {
          from: 'dynamicsubmissions',
          let: {
            eventId: '$_id',
            formIds: '$forms.formId',
            workerIds: '$assignedWorkers.workerId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$eventId', '$$eventId'] },
                    { $in: ['$formId', '$$formIds'] },
                    { $in: ['$workerId', '$$workerIds'] },
                    { $eq: ['$status', 'submitted'] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: {
                  formId: '$formId',
                  workerId: '$workerId',
                },
              },
            },
          ],
          as: 'submittedPairs',
        },
      },
      {
        $addFields: {
          totalForms: { $size: '$formList' },
          totalWorkers: { $size: '$assignedWorkers' },
          totalExpected: { $multiply: [{ $size: '$formList' }, { $size: '$assignedWorkers' }] },
          submissions: { $size: '$submittedPairs' },
        },
      },
      {
        $addFields: {
          completionPercentage: {
            $cond: [
              { $gt: ['$totalExpected', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$submissions', '$totalExpected'] },
                      100,
                    ],
                  },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          name: 1,
          status: 1,
          totalForms: 1,
          totalWorkers: 1,
          totalExpected: 1,
          submissions: 1,
          completionPercentage: 1,
        },
      },
      {
        $sort: { completionPercentage: -1, submissions: -1 },
      },
    ]);

    const active = events.filter((event) => event.status === 'active').length;
    const expired = events.filter((event) => event.status !== 'active').length;

    res.json({
      success: true,
      data: {
        events,
        summary: {
          totalEvents: events.length,
          active,
          expired,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event progress',
      error: error.message,
    });
  }
};

export const getTopWorkers = async (req, res) => {
  try {
    const topWorkers = await DynamicSubmission.aggregate([
      {
        $match: {
          status: 'submitted',
          workerId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$workerId',
          submissions: { $sum: 1 },
          latestActivity: { $max: '$submittedAt' },
        },
      },
      {
        $sort: { submissions: -1, latestActivity: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'worker',
        },
      },
      {
        $unwind: '$worker',
      },
      {
        $project: {
          _id: 0,
          workerId: '$_id',
          name: '$worker.name',
          email: '$worker.email',
          submissions: 1,
          latestActivity: 1,
        },
      },
    ]);

    res.json({ success: true, data: topWorkers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top workers',
      error: error.message,
    });
  }
};

export const getStatusBreakdown = async (req, res) => {
  try {
    const submitted = await DynamicSubmission.countDocuments({ status: 'submitted' });
    const expired = await DynamicSubmission.countDocuments({ status: 'expired' });
    const drafts = await DynamicDraft.countDocuments();
    const total = submitted + expired + drafts;

    res.json({
      success: true,
      data: {
        submitted,
        expired,
        drafts,
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status breakdown',
      error: error.message,
    });
  }
};

export const getMyHeatmap = async (req, res) => {
  try {
    const workerId = req.user.id;

    const stateCityCounts = await DynamicSubmission.aggregate([
      {
        $match: {
          workerId: new mongoose.Types.ObjectId(workerId),
          'location.state': { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: {
            state: '$location.state',
            city: '$location.city',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const states = [];
    const points = [];
    const stateMap = new Map();

    for (const item of stateCityCounts) {
      const stateName = item._id.state || 'Unknown';
      const cityName = item._id.city || 'Unknown';
      const count = item.count;

      const stateKey = stateName.trim();
      const stateEntry = stateMap.get(stateKey) || { state: stateKey, stateCount: 0, cities: [] };
      stateEntry.stateCount += count;
      stateEntry.cities.push({ city: cityName, count });
      stateMap.set(stateKey, stateEntry);

      const coord = getCoordinatesForLocation(stateName, cityName);
      if (coord) {
        points.push({
          state: stateKey,
          city: cityName,
          count,
          lat: coord.lat,
          lng: coord.lng,
        });
      }
    }

    for (const entry of stateMap.values()) {
      states.push(entry);
    }

    states.sort((a, b) => b.stateCount - a.stateCount);
    points.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        states,
        points,
        center: { lat: 20.0, lng: 78.0 },
        zoom: 4,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker heatmap data',
      error: error.message,
    });
  }
};

export const getMyTimeline = async (req, res) => {
  try {
    const workerId = req.user.id;

    const recentSubmissions = await DynamicSubmission.find({ workerId: new mongoose.Types.ObjectId(workerId) })
      .populate('formId', 'title')
      .populate('eventId', 'name')
      .sort({ submittedAt: -1 })
      .limit(12)
      .lean();

    const activeEvents = await Event.find({
      'assignedWorkers.workerId': new mongoose.Types.ObjectId(workerId),
      status: 'active',
    })
      .select('name createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        submissions: recentSubmissions.map((sub) => ({
          submissionId: sub._id,
          formTitle: sub.formId?.title || 'Untitled',
          eventName: sub.eventId?.name || 'Unknown event',
          submittedAt: sub.submittedAt,
          location: sub.location,
          status: sub.status,
        })),
        activeEvents: activeEvents.map((event) => ({
          eventId: event._id,
          name: event.name,
          createdAt: event.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker timeline',
      error: error.message,
    });
  }
};

export const getMyStats = async (req, res) => {
  try {
    const workerId = req.user.id;

    const totalReports = await DynamicSubmission.countDocuments({ workerId: new mongoose.Types.ObjectId(workerId), status: 'submitted' });
    const draftCount = await DynamicDraft.countDocuments({ workerId: new mongoose.Types.ObjectId(workerId) });
    const activeEvents = await Event.countDocuments({
      'assignedWorkers.workerId': new mongoose.Types.ObjectId(workerId),
      status: 'active',
    });
    const latestSubmission = await DynamicSubmission.findOne({ workerId: new mongoose.Types.ObjectId(workerId), status: 'submitted' })
      .sort({ submittedAt: -1 })
      .select('submittedAt')
      .lean();

    res.json({
      success: true,
      data: {
        totalReports,
        draftCount,
        activeEvents,
        latestSubmission: latestSubmission?.submittedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker stats',
      error: error.message,
    });
  }
};

export const getMyEventSummary = async (req, res) => {
  try {
    const workerId = req.user.id;

    const eventSummary = await DynamicSubmission.aggregate([
      {
        $match: {
          workerId: new mongoose.Types.ObjectId(workerId),
          status: 'submitted',
        },
      },
      {
        $group: {
          _id: '$eventId',
          submissionCount: { $sum: 1 },
          latestActivity: { $max: '$submittedAt' },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          eventName: '$event.name',
          submissionCount: 1,
          latestActivity: 1,
        },
      },
      {
        $sort: { submissionCount: -1, latestActivity: -1 },
      },
    ]);

    res.json({ success: true, data: eventSummary });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker event summary',
      error: error.message,
    });
  }
};
