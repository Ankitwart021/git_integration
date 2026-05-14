import React, { useState, useEffect } from 'react';
import DataTable from './tables/DataTable';
import { roleResourceAPI } from '../apis/authApis';
import { useData } from '../context/DataContext';
import { UserRoleMapping, RoleResourceMapping, TableColumn } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { users, roles, loading: dataLoading } = useData();
  const [userRoleMappings, setUserRoleMappings] = useState<UserRoleMapping[]>([]);
  const [roleResourceMappings, setRoleResourceMappings] = useState<RoleResourceMapping[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform users data into User Role Mapping format
  useEffect(() => {
    if (!dataLoading && users.length > 0) {
      const mappings: UserRoleMapping[] = users.map(user => ({
        id: user.id,
        username: user.username,
        roles: user.roles || []
      }));
      setUserRoleMappings(mappings);
    }
  }, [users, dataLoading]);

  // Fetch Role Resource Mappings from API
  useEffect(() => {
    const fetchRoleResourceMappings = async () => {
      try {
        setLoading(true);
        const response = await roleResourceAPI.getAllRoleResourceMappings();
        
        console.log('Role Resource Mappings API response:', response);
        
        // Transform API response to match table format
        if (response && response.resource && Array.isArray(response.resource)) {
          const mappings: RoleResourceMapping[] = response.resource.map((item: any) => ({
            id: item.id,
            role: item.role,
            resources: [item.resource], // Single resource as array
            operations: item.action || [] // actions array from API
          }));
          setRoleResourceMappings(mappings);
        } else {
          console.warn('Unexpected API response format:', response);
          setRoleResourceMappings([]);
        }
      } catch (error) {
        console.error('Error fetching role resource mappings:', error);
        setRoleResourceMappings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleResourceMappings();
  }, []);

  // Define table columns
  const userColumns: TableColumn[] = [
    { key: 'username', label: 'User name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
  ];

  const roleColumns: TableColumn[] = [
    { key: 'name', label: 'Roles', sortable: true },
  ];

  const userRoleMappingColumns: TableColumn[] = [
    { key: 'username', label: 'User name', sortable: true },
    { key: 'roles', label: 'Roles', sortable: true },
  ];

  const roleResourceMappingColumns: TableColumn[] = [
    { key: 'role', label: 'Role', sortable: true },
    { key: 'resources', label: 'Resource', sortable: true },
    { key: 'operations', label: 'Actions', sortable: true },
  ];

  if (dataLoading || loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="breadcrumb">
          <span className="breadcrumb-item">
            <button className="breadcrumb-link" onClick={() => {}}>IAM</button>
          </span>
          <span className="breadcrumb-item active">Dashboard</span>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <DataTable
              title="Users"
              columns={userColumns}
              data={users}
              className="users-table"
            />
          </div>

          <div className="dashboard-section">
            <DataTable
              title="Roles"
              columns={roleColumns}
              data={roles}
              className="roles-table"
            />
          </div>

          <div className="dashboard-section">
            <DataTable
              title="User Role Mapping"
              columns={userRoleMappingColumns}
              data={userRoleMappings}
              className="user-role-mapping-table"
            />
          </div>

          <div className="dashboard-section">
            <DataTable
              title="Role Resource Mapping"
              columns={roleResourceMappingColumns}
              data={roleResourceMappings}
              className="role-resource-mapping-table"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;