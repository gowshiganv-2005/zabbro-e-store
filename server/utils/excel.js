/**
 * Database Utility Module (MongoDB version)
 * Drop-in replacement for the Excel utility module
 * Same function signatures — routes don't need any changes
 */

const { Product, User, Order, Inventory, Review } = require('../models');

// Map filenames to MongoDB models
const MODEL_MAP = {
  'products.xlsx': Product,
  'users.xlsx': User,
  'orders.xlsx': Order,
  'inventory.xlsx': Inventory,
  'reviews.xlsx': Review
};

function getModel(filename) {
  const model = MODEL_MAP[filename];
  if (!model) {
    console.error(`No model found for file: ${filename}`);
    return null;
  }
  return model;
}

/**
 * Read all data from a collection (replaces readExcel)
 * @param {string} filename - Original Excel filename (e.g., 'products.xlsx')
 * @returns {Array} Array of plain objects
 */
function readExcel(filename) {
  const Model = getModel(filename);
  if (!Model) return [];

  // Use synchronous-like pattern with a cache for compatibility
  // Since routes use this synchronously, we need a sync wrapper
  // This is handled by the async initialization in server.js
  throw new Error('Use readExcelAsync instead, or call from async context');
}

/**
 * Async version of readExcel
 */
async function readExcelAsync(filename) {
  const Model = getModel(filename);
  if (!Model) return [];

  try {
    const docs = await Model.find({}).lean();
    return docs.map(doc => {
      const { _id, __v, ...rest } = doc;
      return rest;
    });
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return [];
  }
}

/**
 * Write (replace all) data to a collection (replaces writeExcel)
 */
async function writeExcelAsync(filename, data) {
  const Model = getModel(filename);
  if (!Model) return false;

  try {
    await Model.deleteMany({});
    if (data.length > 0) {
      await Model.insertMany(data);
    }
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    return false;
  }
}

/**
 * Append a single row to a collection (replaces appendRow)
 */
async function appendRowAsync(filename, row) {
  const Model = getModel(filename);
  if (!Model) return false;

  try {
    await Model.create(row);
    return true;
  } catch (error) {
    console.error(`Error appending to ${filename}:`, error.message);
    return false;
  }
}

/**
 * Update a row by matching a field value (replaces updateRow)
 */
async function updateRowAsync(filename, matchField, matchValue, updates) {
  const Model = getModel(filename);
  if (!Model) return false;

  try {
    const result = await Model.updateOne(
      { [matchField]: String(matchValue) },
      { $set: updates }
    );
    return result.modifiedCount > 0 || result.matchedCount > 0;
  } catch (error) {
    console.error(`Error updating ${filename}:`, error.message);
    return false;
  }
}

/**
 * Delete a row by matching a field value (replaces deleteRow)
 */
async function deleteRowAsync(filename, matchField, matchValue) {
  const Model = getModel(filename);
  if (!Model) return false;

  try {
    const result = await Model.deleteOne({ [matchField]: String(matchValue) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting from ${filename}:`, error.message);
    return false;
  }
}

/**
 * Find a single row by matching a field value (replaces findRow)
 */
async function findRowAsync(filename, matchField, matchValue) {
  const Model = getModel(filename);
  if (!Model) return null;

  try {
    const doc = await Model.findOne({ [matchField]: String(matchValue) }).lean();
    if (!doc) return null;
    const { _id, __v, ...rest } = doc;
    return rest;
  } catch (error) {
    console.error(`Error finding in ${filename}:`, error.message);
    return null;
  }
}

/**
 * Find multiple rows by matching a field value (replaces findRows)
 */
async function findRowsAsync(filename, matchField, matchValue) {
  const Model = getModel(filename);
  if (!Model) return [];

  try {
    const docs = await Model.find({ [matchField]: String(matchValue) }).lean();
    return docs.map(doc => {
      const { _id, __v, ...rest } = doc;
      return rest;
    });
  } catch (error) {
    console.error(`Error finding rows in ${filename}:`, error.message);
    return [];
  }
}

module.exports = {
  readExcel: readExcelAsync,
  writeExcel: writeExcelAsync,
  appendRow: appendRowAsync,
  updateRow: updateRowAsync,
  deleteRow: deleteRowAsync,
  findRow: findRowAsync,
  findRows: findRowsAsync,
  DATA_DIR: ''
};
