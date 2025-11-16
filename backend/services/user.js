import db from '../models'

export const getContact = (payload,id) => new Promise(async (resolve, reject) => {
    try {
      const existingRecord = await db.CustomerSupport.findOne({
        where: { id },
      });

      let response;

      if (existingRecord) {
        response = await existingRecord.update(payload);
        resolve({
          err: 0,
          msg: 'Customer support record updated successfully.',
        });
      } else {
        // Nếu không tồn tại, tạo bản ghi mới
        response = await db.CustomerSupport.create({
            ...payload,
            accountId, // Thêm accountId vào bản ghi
          });
        resolve({
          err: 0,
          msg: 'Customer support record created successfully.',
          data: response,
        });
      }
    } catch (error) {
      reject({
        err: 1,
        msg: 'An error occurred while creating or updating the customer support record.',
        error: error.message || error,
      });
    }
  });

export const getOne = (id) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.findOne({
            where: { id },
            raw: true,
            attributes: {
                exclude: ['password']
            }
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Failed to get provinces.',
            response
        })
    } catch (error) {
        reject(error)
    }
})

export const updateuser = (payload, id) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.update(payload, {
            where: { id }
        })
        resolve({
            err: response[0] > 0 ? 0 : 1,
            msg: response[0] > 0 ? 'Update ' : 'Failed to update user.',
        })
    } catch (error) {
        reject(error)
    }
})