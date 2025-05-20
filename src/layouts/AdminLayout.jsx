import React from 'react'
import HeaderAdmin from '../components/admin/header'
import SidebarAdmin from '../components/admin/sidebar'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <HeaderAdmin />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <SidebarAdmin />

        {/* Content */}
        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
