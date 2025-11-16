import * as services from '../services/user'


export const updateUserController = async (req, res) => {
    const { id } = req.user
    const payload = req.body
    try {
        if(!payload) return res.status(400).json({
            err: 1,
            msg:'miss payload'
        })
        const response = await services.updateuser(payload, id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at category controller: ' + error
        })
    }
}

export const getContactcontroller = async (req, res) => {
    const { id } = req.user
    const payload = req.body
    try {
        if(!payload) return res.status(400).json({
            err: 1,
            msg:'miss payload'
        })
        const response = await services.getContact(payload, id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at category controller: ' + error
        })
    }
}


export const getCurrent = async (req, res) => {
    const { id } = req.user
    try {
        const response = await services.getOne(id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at category controller: ' + error
        })
    }
}