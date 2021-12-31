import mongoose from 'mongoose';
import config from 'config';

mongoose.set('debug', true);

const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const tinyUrlModelSchema = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  short_url: { type: String, required: true },
  slug: { type: String, default: '' },
  url: { type: String, required: true },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: Date,
  updatedAt: Date,
};

const tinyUrlSchema = new Schema(tinyUrlModelSchema, schemaOptions);

tinyUrlSchema.pre('save', async function preSave(next) {
  const currentDate = new Date();
  this.updatedAt = currentDate;

  if (!this.createdAt) {
    this.createdAt = currentDate;
  }

  next();
});

// eslint-disable-next-line consistent-return
tinyUrlSchema.statics.findOneOrCreate = async function findOneOrCreate(query, data) {
  try {
    const found = await this.findOne(query);

    return found || this.create(data);
  } catch (e) {
    return new Error(`Tiny Url Schema findOneOrCreate error: ${e.message}.`);
  }
};

const tinyUrlModel = mongoose.model('tiny-url', tinyUrlSchema);

export default tinyUrlModel;
