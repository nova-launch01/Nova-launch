import { BurnButton } from './BurnButton';

const meta = {
  title: 'BurnToken/BurnButton',
  component: BurnButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: () => {},
    tooltip: 'Burn tokens permanently',
    size: 'md',
    showIcon: true,
    disabled: false,
    loading: false,
  },
};

export default meta;

export const Default = {};

export const Loading = {
  args: {
    loading: true,
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

export const WithoutIcon = {
  args: {
    showIcon: false,
  },
};

export const Small = {
  args: {
    size: 'sm',
  },
};

export const Large = {
  args: {
    size: 'lg',
  },
};
