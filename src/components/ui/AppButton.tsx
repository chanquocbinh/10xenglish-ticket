'use client';

import { forwardRef } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

/**
 * Shared primary action button.
 * Defaults to MUI `contained` + `color="primary"` (background = --color-primary).
 * All props are forwarded, so callers can still override variant/color when needed.
 */
export const AppButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AppButton(props, ref) {
    return <Button ref={ref} variant="contained" color="primary" {...props} />;
  },
);
