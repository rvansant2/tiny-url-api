import express from 'express';
import config from 'config';

import winstonLogger from '../lib/logger/winston';
import authenticateToken from '../middleware/authenticate/apiAccessToken';
import tinyUrlModel from '../models/tinyUrlModel';

const router = express.Router();

router
  .get('/:slug?', authenticateToken, async (req, res, next) => {
    try {
      let tinyUrls;
      if (req.isAuthorized && !req.params.slug) {
        tinyUrls = await tinyUrlModel
          .find({ status: 'active' })
          .select({ short_url: 1, slug: 1, url: 1 });
      } else if (req.isAuthorized && req.params.slug) {
        tinyUrls = await tinyUrlModel
          .find({ status: 'active', slug: req.params.slug })
          .select({ short_url: 1, slug: 1, url: 1 });
      }
      res.status(200).json({ message: 'success', data: tinyUrls });
    } catch (e) {
      // eslint-disable-next-line no-console
      winstonLogger.error(`Error: ${e.message}`);
      next();
    }
  })
  // eslint-disable-next-line max-statements
  .post('/', authenticateToken, async (req, res, next) => {
    try {
      const cleanedTinyUrl = {};
      const { url, slug } = req.body;
      const tinyUrlExists = await tinyUrlModel.findOne({ slug, url, status: 'active' });
      if (tinyUrlExists) {
        res.status(422).json({ message: { errors: { url: ['has already been taken.'] } } });
      } else {
        const savedSlug =
          slug ||
          Math.random()
            .toString(36)
            .substr(2, 8);
        const shortUrl = `${config.get('application.baseURL')}/${savedSlug}`;
        // console.log('shortUrl:', shortUrl);
        const tinyUrl = await tinyUrlModel.findOneOrCreate(
          { slug, url, status: 'active' },
          { short_url: shortUrl, slug: savedSlug, url },
        );
        cleanedTinyUrl.url = tinyUrl.url;
        cleanedTinyUrl.slug = tinyUrl.slug;
        cleanedTinyUrl.short_url = tinyUrl.short_url;
        res.status(200).json({ message: 'sucess', data: cleanedTinyUrl });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      winstonLogger.error(`Error: ${e.message}`);
      next();
    }
  });

export default router;
