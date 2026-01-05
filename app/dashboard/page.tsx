import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const pool = getPool();

  // Get statistics
  const [dbCount, prodCount, recentEdits] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM databases'),
    pool.query(
      "SELECT COUNT(*) as count FROM databases WHERE environment = 'prod'"
    ),
    pool.query(
      `SELECT COUNT(*) as count FROM audit_logs 
       WHERE action IN ('UPDATE', 'INSERT', 'DELETE') 
       AND timestamp > NOW() - INTERVAL '24 hours'`
    ),
  ]);

  const stats = {
    totalDatabases: parseInt(dbCount.rows[0].count),
    productionDatabases: parseInt(prodCount.rows[0].count),
    recentEdits: parseInt(recentEdits.rows[0].count),
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Manage all your PostgreSQL databases from one secure dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="card hover:shadow-medium transition-all duration-300 group">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Databases</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDatabases}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-medium transition-all duration-300 group">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center group-hover:bg-danger-200 transition-colors">
                  <svg className="w-6 h-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Production DBs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.productionDatabases}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-medium transition-all duration-300 group">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                  <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Recent Edits (24h)</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recentEdits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1">Jump to the most common tasks</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/databases"
              className="group p-6 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-soft transition-all duration-200 hover:bg-primary-50/50"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Databases</h3>
              <p className="text-sm text-gray-600">Register and configure your PostgreSQL databases</p>
            </Link>

            <Link
              href="/dashboard/projects"
              className="group p-6 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-soft transition-all duration-200 hover:bg-primary-50/50"
            >
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success-200 transition-colors">
                <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
              <p className="text-sm text-gray-600">Organize databases by website or project</p>
            </Link>

            <Link
              href="/dashboard/audit-logs"
              className="group p-6 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-soft transition-all duration-200 hover:bg-primary-50/50"
            >
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-warning-200 transition-colors">
                <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit Logs</h3>
              <p className="text-sm text-gray-600">View complete history of all database changes</p>
            </Link>

            <Link
              href="/dashboard/settings"
              className="group p-6 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-soft transition-all duration-200 hover:bg-primary-50/50"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
              <p className="text-sm text-gray-600">Configure your account and security preferences</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

