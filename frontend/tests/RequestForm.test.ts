import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RequestForm from '../src/components/RequestForm.vue';

vi.mock('../src/stores/requests.js', () => ({
  useRequestsStore: () => ({
    createRequest: vi.fn(),
  }),
}));

describe('RequestForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('disables submit when end < start', async () => {
    const wrapper = mount(RequestForm);
    await wrapper.find('#start-date').setValue('2026-07-10');
    await wrapper.find('#end-date').setValue('2026-07-05');
    const btn = wrapper.find('button[type="submit"]');
    expect((btn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables submit when end >= start', async () => {
    const wrapper = mount(RequestForm);
    await wrapper.find('#start-date').setValue('2026-07-01');
    await wrapper.find('#end-date').setValue('2026-07-05');
    const btn = wrapper.find('button[type="submit"]');
    expect((btn.element as HTMLButtonElement).disabled).toBe(false);
  });
});
