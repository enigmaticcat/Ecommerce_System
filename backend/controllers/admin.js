import * as adminService from '../services/admin'

export const login = async (req, res) => {
    const { phone, password } = req.body
    try {
        if (!phone || !password) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs !'
        })
        const response = await adminService.loginService(req.body)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Fail at admin controller: ' + error
        })
    }
}
export const InfoUser = async(req, res) =>{
    try {
        const response = await adminService.InfoUser()
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json('Failed at admin controller:' +error)
    }
} 

