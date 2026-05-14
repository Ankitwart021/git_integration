import axios from 'axios';

class KeycloakService {
  private baseUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = process.env.KEYCLOAK_URL || '';
    this.realm = process.env.REALM || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
  }

  /**
   * Fetch admin access token using client credentials
   * @returns {Promise<string>} Admin access token
   */
  async getAdminToken(): Promise<string> {
    try {
      if (!this.baseUrl || !this.realm || !this.clientId || !this.clientSecret) {
         throw new Error('Keycloak environment variables are not fully configured');
      }

      const tokenEndpoint = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
      
      const payload = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      const response = await axios.post(tokenEndpoint, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data.access_token;
    } catch (error: any) {
      console.error('Error fetching Keycloak admin token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Keycloak as admin');
    }
  }

  /**
   * Fetch users from Keycloak Admin API
   * Uses Admin token and fetches role mappings for each user
   * @returns {Promise<any[]>} List of Keycloak users with roles
   */
  async fetchUsers(): Promise<any[]> {
    try {
      const adminToken = await this.getAdminToken();
      // Use Admin API to get users
      const usersEndpoint = `${this.baseUrl}/admin/realms/${this.realm}/users`;
      
      const response = await axios.get(usersEndpoint, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      const users = response.data;

      // Fetch role mappings for each user concurrently
      const usersWithRoles = await Promise.all(
        users.map(async (user: any) => {
          try {
            const rolesEndpoint = `${this.baseUrl}/admin/realms/${this.realm}/users/${user.id}/role-mappings/realm`;
            const rolesResponse = await axios.get(rolesEndpoint, {
              headers: {
                Authorization: `Bearer ${adminToken}`
              }
            });
            // Extract role names
            const roles = rolesResponse.data.map((role: any) => role.name);
            return {
              ...user,
              roles
            };
          } catch (roleError: any) {
            console.error(`Error fetching roles for user ${user.id}:`, roleError.response?.data || roleError.message);
            return {
              ...user,
              roles: []
            };
          }
        })
      );

      return usersWithRoles;
    } catch (error: any) {
      console.error('Error fetching Keycloak users:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error_description || 'Failed to fetch users from Keycloak Admin API');
    }
  }
}

export default new KeycloakService();
