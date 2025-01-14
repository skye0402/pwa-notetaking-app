'use client';

import { Layout } from '@/components/layout/Layout';
import { MagnifyingGlassIcon, UserGroupIcon, ChartBarIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function Apps() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer Management</h2>
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">My Customers</h3>
                  <p className="text-sm text-gray-500">Finance 360 View</p>
                  <p className="text-xs text-gray-400">SAP Customer Guide</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Customer Factsheet</h3>
                  <p className="text-sm text-gray-500">Customer Projects</p>
                  <p className="text-xs text-gray-400">SAP S/4HANA Professional Services</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Customer Projects</h3>
                  <p className="text-sm text-gray-500">Commercial Services</p>
                  <p className="text-xs text-gray-400">Professional Services</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">8</span>
                  <FolderIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">My Project Management</h2>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Project Factsheet</h3>
                <p className="text-sm text-gray-500">Customer Projects</p>
                <p className="text-xs text-gray-400">SAP S/4HANA Professional Services</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
