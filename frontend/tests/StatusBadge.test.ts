import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusBadge from '../src/components/StatusBadge.vue';

describe('StatusBadge', () => {
  it('renders pending with correct class', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'pending' } });
    expect(wrapper.classes()).toContain('status-badge--pending');
    expect(wrapper.text()).toBe('pending');
  });

  it('renders approved with correct class', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'approved' } });
    expect(wrapper.classes()).toContain('status-badge--approved');
  });

  it('renders rejected with correct class', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'rejected' } });
    expect(wrapper.classes()).toContain('status-badge--rejected');
  });
});
