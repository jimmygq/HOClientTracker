'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';

const API = '/api';

export function useRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/requests`, { params: filters });
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (payload) => {
    const { data } = await axios.post(`${API}/requests`, payload);
    return data;
  }, []);

  const updateRequest = useCallback(async (id, payload) => {
    const { data } = await axios.put(`${API}/requests/${id}`, payload);
    return data;
  }, []);

  const deleteRequest = useCallback(async (id) => {
    const { data } = await axios.delete(`${API}/requests/${id}`);
    return data;
  }, []);

  const addUpdate = useCallback(async (id, author, note) => {
    const { data } = await axios.post(`${API}/requests/${id}/updates`, { author, note });
    return data;
  }, []);

  const pingSlack = useCallback(async (id, author) => {
    const { data } = await axios.post(`${API}/requests/${id}/ping`, { author });
    return data;
  }, []);

  const fetchRequest = useCallback(async (id) => {
    const { data } = await axios.get(`${API}/requests/${id}`);
    return data;
  }, []);

  return { requests, loading, error, fetchRequests, fetchRequest, createRequest, updateRequest, deleteRequest, addUpdate, pingSlack };
}
