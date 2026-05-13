import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RejectDialog from '../src/components/RejectDialog.vue';

describe('RejectDialog', () => {
  it('disables submit when comment is empty', () => {
    const wrapper = mount(RejectDialog);
    const btn = wrapper.find('button.btn-danger');
    expect((btn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables submit when comment is non-empty', async () => {
    const wrapper = mount(RejectDialog);
    await wrapper.find('textarea').setValue('Too busy that week');
    const btn = wrapper.find('button.btn-danger');
    expect((btn.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('emits confirm with comment on submit', async () => {
    const wrapper = mount(RejectDialog);
    await wrapper.find('textarea').setValue('Not enough staff');
    await wrapper.find('button.btn-danger').trigger('click');
    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Not enough staff']);
  });

  it('emits cancel when Cancel is clicked', async () => {
    const wrapper = mount(RejectDialog);
    await wrapper.find('button.btn-ghost').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
