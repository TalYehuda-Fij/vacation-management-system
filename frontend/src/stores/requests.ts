import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { VacationRequest, RequestStatus, PaginatedResponse } from '../types/index.js';
import { requestsApi } from '../api/index.js';

export const useRequestsStore = defineStore('requests', () => {
  const myRequests = ref<VacationRequest[]>([]);
  const allRequests = ref<VacationRequest[]>([]);
  const pagination = ref<Omit<PaginatedResponse<unknown>, 'items'>>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const loading = ref(false);
  const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    toast.value = { message, type };
    setTimeout(() => (toast.value = null), 3500);
  }

  async function fetchMine() {
    loading.value = true;
    try {
      const res = await requestsApi.getMine();
      myRequests.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createRequest(data: { start_date: string; end_date: string; reason?: string }) {
    const res = await requestsApi.create(data);
    myRequests.value.unshift(res.data);
  }

  async function fetchAll(params: {
    status?: RequestStatus;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    loading.value = true;
    try {
      const res = await requestsApi.getAll(params);
      allRequests.value = res.data.items;
      pagination.value = {
        total: res.data.total,
        page: res.data.page,
        pageSize: res.data.pageSize,
        totalPages: res.data.totalPages,
      };
    } finally {
      loading.value = false;
    }
  }

  async function approve(id: string, comments?: string) {
    const prev = allRequests.value.find((r) => r.id === id);
    if (prev) prev.status = 'approved';
    try {
      const res = await requestsApi.approve(id, comments);
      const idx = allRequests.value.findIndex((r) => r.id === id);
      if (idx !== -1) allRequests.value[idx] = res.data;
      showToast('Request approved', 'success');
    } catch (err) {
      if (prev) prev.status = 'pending';
      showToast('Failed to approve request', 'error');
      throw err;
    }
  }

  async function reject(id: string, comments: string) {
    const prev = allRequests.value.find((r) => r.id === id);
    if (prev) prev.status = 'rejected';
    try {
      const res = await requestsApi.reject(id, comments);
      const idx = allRequests.value.findIndex((r) => r.id === id);
      if (idx !== -1) allRequests.value[idx] = res.data;
      showToast('Request rejected', 'success');
    } catch (err) {
      if (prev) prev.status = 'pending';
      showToast('Failed to reject request', 'error');
      throw err;
    }
  }

  return {
    myRequests,
    allRequests,
    pagination,
    loading,
    toast,
    fetchMine,
    createRequest,
    fetchAll,
    approve,
    reject,
  };
});
