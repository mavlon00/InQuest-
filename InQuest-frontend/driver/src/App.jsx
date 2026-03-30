/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import DriverApp from './driver/app/DriverApp';
import { useDriverStore } from './driver/app/driverStore';
import api from './driver/utils/api';

function TokenHandler() {
  const login = useDriverStore((state) => state.login);

  useEffect(() => {
    // Handle token passed from landing page via ?token= URL param
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      // Strip token from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Fetch user profile and log in
      api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.data.status === 'success') {
          login({ user: res.data.data, access_token: token });
        }
      }).catch(console.error);
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <TokenHandler />
      <DriverApp />
    </>
  );
}
