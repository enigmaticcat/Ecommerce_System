import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Category = ({ token }) => {
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [newCategory, setNewCategory] = useState("")
    const [newSubCategory, setNewSubCategory] = useState("")

    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list')
            if (response.data.success) {
                setCategories(response.data.categories)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const fetchSubCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/sub/list')
            if (response.data.success) {
                setSubCategories(response.data.subCategories)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const addCategory = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(backendUrl + '/api/category/add', { name: newCategory }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                setNewCategory("")
                fetchCategories()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const addSubCategory = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(backendUrl + '/api/category/sub/add', { name: newSubCategory }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                setNewSubCategory("")
                fetchSubCategories()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeCategory = async (id) => {
        try {
            const response = await axios.post(backendUrl + '/api/category/remove', { id }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                fetchCategories()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeSubCategory = async (id) => {
        try {
            const response = await axios.post(backendUrl + '/api/category/sub/remove', { id }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                fetchSubCategories()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchSubCategories()
    }, [])

    return (
        <div className='flex flex-col gap-8'>
            {/* Category Section */}
            <div className='flex flex-col gap-4'>
                <h2 className='text-3xl font-bold'>Quản lý Danh mục (Category)</h2>
                <form onSubmit={addCategory} className='flex gap-4 items-center'>
                    <input 
                        type="text" 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)} 
                        className='px-4 py-2 border rounded-md w-[300px]'
                        placeholder='Nhập tên danh mục mới (Ví dụ: Men)' 
                        required 
                    />
                    <button type='submit' className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors'>THÊM</button>
                </form>
                
                <div className='flex flex-col gap-2 mt-2'>
                    <div className='grid grid-cols-[1fr_1fr] md:grid-cols-[2fr_1fr] bg-gray-100 p-2 font-bold rounded-t-md'>
                        <p>Tên</p>
                        <p className='text-right md:text-center'>Hành động</p>
                    </div>
                    {categories.map((item, index) => (
                        <div key={index} className='grid grid-cols-[1fr_1fr] md:grid-cols-[2fr_1fr] p-2 border-b items-center text-sm'>
                            <p>{item.name}</p>
                            <p 
                                onClick={() => removeCategory(item._id)} 
                                className='text-right md:text-center text-red-500 cursor-pointer hover:underline'
                            >
                                Xóa
                            </p>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-gray-500 py-4">Chưa có danh mục nào.</p>}
                </div>
            </div>

            <hr className="border-gray-300" />

            {/* SubCategory Section */}
            <div className='flex flex-col gap-4'>
                <h2 className='text-3xl font-bold'>Quản lý Loại (SubCategory)</h2>
                <form onSubmit={addSubCategory} className='flex gap-4 items-center'>
                    <input 
                        type="text" 
                        value={newSubCategory} 
                        onChange={(e) => setNewSubCategory(e.target.value)} 
                        className='px-4 py-2 border rounded-md w-[300px]'
                        placeholder='Nhập tên loại mới (Ví dụ: Topwear)' 
                        required 
                    />
                    <button type='submit' className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors'>THÊM</button>
                </form>
                
                <div className='flex flex-col gap-2 mt-2'>
                    <div className='grid grid-cols-[1fr_1fr] md:grid-cols-[2fr_1fr] bg-gray-100 p-2 font-bold rounded-t-md'>
                        <p>Tên</p>
                        <p className='text-right md:text-center'>Hành động</p>
                    </div>
                    {subCategories.map((item, index) => (
                        <div key={index} className='grid grid-cols-[1fr_1fr] md:grid-cols-[2fr_1fr] p-2 border-b items-center text-sm'>
                            <p>{item.name}</p>
                            <p 
                                onClick={() => removeSubCategory(item._id)} 
                                className='text-right md:text-center text-red-500 cursor-pointer hover:underline'
                            >
                                Xóa
                            </p>
                        </div>
                    ))}
                    {subCategories.length === 0 && <p className="text-center text-gray-500 py-4">Chưa có loại nào.</p>}
                </div>
            </div>
        </div>
    )
}

export default Category
