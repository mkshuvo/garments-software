'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Chip,
  Stack,
  Typography,
  Autocomplete,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface SearchSectionProps {
  value: string;
  onChange: (value: string) => void;
  onQuickFilter: (filter: string) => void;
  searchHistory?: string[];
  popularSearches?: string[];
}

const QUICK_FILTERS = [
  'Today',
  'This Week',
  'This Month',
  'High Amount',
  'Low Amount',
  'Pending',
  'Completed'
];

export function SearchSection({ 
  value, 
  onChange, 
  onQuickFilter,
  searchHistory = [],
  popularSearches = []
}: SearchSectionProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  const handleClearSearch = () => {
    onChange('');
    setShowSuggestions(false);
  };

  const handleQuickFilter = (filter: string) => {
    onQuickFilter(filter);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (value || searchHistory.length > 0 || popularSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search journal entries, references, contacts, descriptions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <Tooltip title="Clear search">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 3,
            zIndex: 1000,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {/* Quick Filters */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Filters
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {QUICK_FILTERS.map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuickFilter(filter)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <HistoryIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Recent Searches
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {searchHistory.slice(0, 5).map((search) => (
                  <Chip
                    key={search}
                    label={search}
                    size="small"
                    variant="outlined"
                    onClick={() => onChange(search)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Popular Searches
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {popularSearches.slice(0, 5).map((search) => (
                  <Chip
                    key={search}
                    label={search}
                    size="small"
                    variant="outlined"
                    onClick={() => onChange(search)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
