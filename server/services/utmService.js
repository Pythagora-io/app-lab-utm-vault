const UtmLink = require('../models/UtmLink');
const UserService = require('./userService');

class UtmService {
  async createLink(linkData, userId) {
    try {
      console.log('Creating new UTM link for user:', userId);
      console.log('Link data:', linkData);

      const user = await UserService.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Convert fields to lowercase
      linkData.destination = linkData.destination.toLowerCase();
      if (linkData.term) linkData.term = linkData.term.toLowerCase();
      if (linkData.content) linkData.content = linkData.content.toLowerCase();

      const utmLink = new UtmLink({
        ...linkData,
        organization: user.organization,
        createdBy: userId
      });

      await utmLink.save();
      console.log('UTM link saved successfully');

      const populatedLink = await UtmLink.findById(utmLink._id)
        .populate('createdBy', 'email -_id')
        .lean();

      if (!populatedLink) {
        console.error('Failed to retrieve created UTM link');
        throw new Error('Failed to retrieve created UTM link');
      }

      return {
        id: populatedLink._id,
        destination: populatedLink.destination,
        medium: populatedLink.medium,
        source: populatedLink.source,
        campaign: populatedLink.campaign,
        term: populatedLink.term,
        content: populatedLink.content,
        createdAt: populatedLink.createdAt,
        createdBy: populatedLink.createdBy.email
      };

    } catch (error) {
      console.error('Error creating UTM link:', error);
      throw new Error(`Failed to create UTM link: ${error.message}`);
    }
  }

  async getLinks(userId) {
    try {
      console.log('Fetching UTM links for user:', userId);

      const user = await UserService.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const links = await UtmLink.find({ organization: user.organization })
        .populate('createdBy', 'email -_id')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`Found ${links.length} UTM links`);

      return links.map(link => ({
        id: link._id,
        destination: link.destination,
        medium: link.medium,
        source: link.source,
        campaign: link.campaign,
        term: link.term,
        content: link.content,
        createdAt: link.createdAt,
        createdBy: link.createdBy.email
      }));

    } catch (error) {
      console.error('Error fetching UTM links:', error);
      throw new Error(`Failed to fetch UTM links: ${error.message}`);
    }
  }

  async deleteLink(linkId, userId) {
    try {
      console.log(`Deleting UTM link ${linkId} requested by user:`, userId);

      const user = await UserService.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const link = await UtmLink.findOne({
        _id: linkId,
        organization: user.organization
      });

      if (!link) {
        console.error(`UTM link ${linkId} not found or not accessible`);
        throw new Error('UTM link not found or not accessible');
      }

      await link.deleteOne();
      console.log(`UTM link ${linkId} deleted successfully`);

      return true;

    } catch (error) {
      console.error('Error deleting UTM link:', error);
      throw new Error(`Failed to delete UTM link: ${error.message}`);
    }
  }

  async exportLinks(filters = null, userId) {
    try {
      console.log('Export service - Starting export with filters:', filters);

      const user = await UserService.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let query = { organization: user.organization };
      if (filters) {
        if (filters.medium) query.medium = filters.medium;
        if (filters.source) query.source = filters.source;
        if (filters.campaign) query.campaign = filters.campaign;
      }

      console.log('Export service - MongoDB query:', query);

      const links = await UtmLink.find(query)
        .populate('createdBy', 'email -_id')
        .sort({ createdAt: -1 })
        .lean();

      const exportData = links.map(link => ({
        'Destination URL': link.destination,
        'Medium': link.medium,
        'Source': link.source,
        'Campaign Name': link.campaign,
        'Term': link.term || '',
        'Content': link.content || '',
        'Tracking URL': `${link.destination}?utm_medium=${link.medium}&utm_source=${link.source}&utm_campaign=${link.campaign}${link.term ? `&utm_term=${link.term}` : ''}${link.content ? `&utm_content=${link.content}` : ''}`
      }));

      return exportData;

    } catch (error) {
      console.error('Error in export service:', error);
      throw error;
    }
  }

  async getStats(userId) {
    try {
      console.log('Calculating dashboard statistics');

      const user = await UserService.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const last28Days = new Date(now);
      last28Days.setDate(now.getDate() - 28);
      const previousPeriodStart = new Date(last28Days);
      previousPeriodStart.setDate(last28Days.getDate() - 28);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const monthStart = new Date(now);
      monthStart.setDate(1);

      const allLinks = await UtmLink.find({ organization: user.organization })
        .populate('createdBy', 'email -_id')
        .lean();

      const totalLinks = allLinks.length;
      const linksThisWeek = allLinks.filter(link =>
        new Date(link.createdAt) >= weekStart
      ).length;
      const activeCampaigns = new Set(
        allLinks.map(link => link.campaign)
      ).size;
      const campaignsThisMonth = new Set(
        allLinks
          .filter(link => new Date(link.createdAt) >= monthStart)
          .map(link => link.campaign)
      ).size;
      const teamMembers = new Set(
        allLinks.map(link => link.createdBy.email)
      ).size;
      const linksLast28Days = allLinks.filter(link =>
        new Date(link.createdAt) >= last28Days
      ).length;
      const linksThisMonth = allLinks.filter(link =>
        new Date(link.createdAt) >= monthStart
      ).length;
      const linksPreviousPeriod = allLinks.filter(link =>
        new Date(link.createdAt) >= previousPeriodStart &&
        new Date(link.createdAt) < last28Days
      ).length;

      const periodChange = linksLast28Days - linksPreviousPeriod;

      const stats = {
        totalLinks,
        linksThisWeek,
        activeCampaigns,
        campaignsThisMonth,
        teamMembers,
        linksLast28Days,
        linksThisMonth,
        periodChange
      };

      console.log('Dashboard statistics calculated:', stats);
      return stats;

    } catch (error) {
      console.error('Error calculating dashboard statistics:', error);
      throw new Error(`Failed to calculate dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = new UtmService();