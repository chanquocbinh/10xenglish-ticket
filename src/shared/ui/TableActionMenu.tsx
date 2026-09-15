'use client';

import { useState, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { MoreVertical } from 'lucide';
import Link from 'next/link';

type MorphIconSource = ComponentProps<typeof MorphIcon>['icon'];

export interface TableActionItem {
  key?: string;
  label: ReactNode;
  icon?: MorphIconSource;
  onClick?: () => void;
  href?: string;
  color?: 'inherit' | 'primary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  hidden?: boolean;
}

export interface TableActionMenuProps {
  actions: TableActionItem[];
  tooltip?: string;
  size?: 'small' | 'medium';
}

export function TableActionMenu({
  actions,
  tooltip = 'Thao tác',
  size = 'small',
}: TableActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const visibleActions = actions.filter((item) => !item.hidden);

  if (visibleActions.length === 0) {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: unknown) => {
    if (event && typeof event === 'object' && 'stopPropagation' in event) {
      const stopPropagation = event.stopPropagation;
      if (typeof stopPropagation === 'function') stopPropagation.call(event);
    }
    setAnchorEl(null);
  };

  const handleItemClick = (e: MouseEvent<HTMLElement>, action: TableActionItem) => {
    e.stopPropagation();
    handleClose();
    if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <>
      <Tooltip title={tooltip} arrow>
        <IconButton
          size={size}
          onClick={handleClick}
          aria-label={tooltip}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          <MorphIcon icon={MoreVertical} size={18} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 150,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)',
              mt: 0.5,
              py: 0.5,
            },
          },
        }}
      >
        {visibleActions.map((action, index) => {
          const isError = action.color === 'error';
          const textColor = isError ? 'error.main' : undefined;

          const itemKey = action.key || (typeof action.label === 'string' ? action.label : index);

          const sharedSx = {
            py: 1,
            px: 1.5,
            fontSize: '0.8125rem',
            color: textColor,
            '&:hover': {
              bgcolor: isError ? 'error.50' : undefined,
              color: isError ? 'error.dark' : undefined,
            },
          } as const;

          const content = (
            <>
              {action.icon && (
                <ListItemIcon sx={{ minWidth: 28, color: textColor || 'text.secondary' }}>
                  <MorphIcon icon={action.icon} size={16} />
                </ListItemIcon>
              )}
              <ListItemText
                primary={action.label}
                primaryTypographyProps={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'inherit',
                }}
              />
            </>
          );

          if (action.href) {
            return (
              <MenuItem
                key={itemKey}
                component={Link}
                href={action.href}
                disabled={action.disabled}
                onClick={(e) => handleItemClick(e, action)}
                sx={sharedSx}
              >
                {content}
              </MenuItem>
            );
          }

          return (
            <MenuItem
              key={itemKey}
              disabled={action.disabled}
              onClick={(e) => handleItemClick(e, action)}
              sx={sharedSx}
            >
              {content}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
