import styled from "styled-components";
import {
  Card,
  Toolbar,
  Typography,
  TextField as MuiTextField,
  Button as MuiButton,
  Select as MuiSelect,
  FormControl as MuiFormControl,
} from "@mui/material";

/* -------------------- Design Tokens / Variables -------------------- */
const colors = {
  primary: {
    main: "#6366F1",
    light: "#818CF8",
    dark: "#4F46E5",
    subtle: "#EEF2FF"
  },
  neutral: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A"
  },
  success: {
    main: "#10B981",
    light: "#34D399",
    dark: "#059669",
    subtle: "#ECFDF5"
  },
  warning: {
    main: "#F59E0B",
    light: "#FBBF24",
    dark: "#D97706",
    subtle: "#FFFBEB"
  },
  error: {
    main: "#EF4444",
    light: "#F87171",
    dark: "#DC2626",
    subtle: "#FEF2F2"
  }
};

const shadows = {
  sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  focus: `0 0 0 4px ${colors.primary.subtle}`
};

const typography = {
  h1: "2.5rem",
  h2: "2rem",
  h3: "1.75rem",
  h4: "1.5rem",
  h5: "1.25rem",
  h6: "1.125rem",
  body: "1rem",
  small: "0.875rem",
  tiny: "0.75rem"
};

const spacing = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem"
};

const borderRadius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px"
};

/* -------------------- Layout / Stat components -------------------- */

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.lg};
  margin: ${spacing.xl} 0;
`;

export const StatCard = styled(Card)`
  padding: ${spacing.xl};
  border-radius: ${borderRadius.lg};
  text-align: center;
  background: white;
  border: 1px solid ${colors.neutral[200]};
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.color || colors.primary.main};
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${shadows.xl};
    border-color: ${colors.neutral[300]};
  }
`;

export const StatNumber = styled(Typography)`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: ${spacing.xs};
  background: linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

export const StatLabel = styled.div`
  color: ${colors.neutral[600]};
  font-size: ${typography.small};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  margin-bottom: ${spacing.xs};
`;

export const StatTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.xs};
  font-size: ${typography.small};
  font-weight: 600;
  color: ${props => props.positive ? colors.success.main : colors.error.main};
`;

/* -------------------- Section / Card -------------------- */

export const SectionCard = styled(Card)`
  margin-bottom: ${spacing.xl};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  background: white;
  border: 1px solid ${colors.neutral[200]};
  box-shadow: ${shadows.md};
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: ${shadows.lg};
  }
`;

export const SectionTitle = styled.h2`
  color: ${colors.neutral[900]};
  margin-bottom: ${spacing.lg};
  font-size: ${typography.h3};
  font-weight: 700;
  padding-bottom: ${spacing.sm};
  border-bottom: 2px solid ${colors.neutral[200]};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark});
    border-radius: 2px;
  }
`;

export const SectionSubtitle = styled.h3`
  color: ${colors.neutral[700]};
  margin-bottom: ${spacing.md};
  font-size: ${typography.h5};
  font-weight: 600;
  opacity: 0.9;
`;

/* -------------------- Form grid -------------------- */

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.lg};
  margin: ${spacing.lg} 0;
`;

/* -------------------- Inputs & Selects (MUI overrides) -------------------- */

export const StyledTextField = styled(MuiTextField)`
  & .MuiOutlinedInput-root {
    border-radius: ${borderRadius.md};
    background: white;
    transition: all 0.2s ease;
    
    fieldset {
      border: 2px solid ${colors.neutral[300]};
      transition: border-color 0.2s ease;
    }
    
    &:hover fieldset {
      border-color: ${colors.neutral[400]};
    }
    
    &.Mui-focused fieldset {
      border-color: ${colors.primary.main};
      box-shadow: ${shadows.focus};
    }
    
    input, textarea {
      padding: 14px 16px;
      font-size: ${typography.body};
      color: ${colors.neutral[800]};
      font-weight: 500;
      
      &::placeholder {
        color: ${colors.neutral[500]};
        opacity: 1;
      }
    }
  }

  & .MuiInputLabel-root {
    font-weight: 600;
    color: ${colors.neutral[700]};
    transform: translate(14px, 16px) scale(1);
    
    &.Mui-focused {
      color: ${colors.primary.main};
    }
  }

  & .MuiInputLabel-shrink {
    transform: translate(14px, -9px) scale(0.85);
    background: white;
    padding: 0 8px;
  }

  & .MuiFormHelperText-root {
    margin: 8px 0 0 4px;
    font-size: ${typography.small};
    color: ${colors.neutral[600]};
  }
`;

export const StyledFormControl = styled(MuiFormControl)`
  & .MuiInputLabel-root {
    font-weight: 600;
    color: ${colors.neutral[700]};
    transform: translate(14px, 16px) scale(1);
    
    &.Mui-focused {
      color: ${colors.primary.main};
    }
  }

  & .MuiInputLabel-shrink {
    transform: translate(14px, -9px) scale(0.85);
    background: white;
    padding: 0 8px;
  }

  & .MuiOutlinedInput-root {
    border-radius: ${borderRadius.md};
    background: white;
    transition: all 0.2s ease;
    
    fieldset {
      border: 2px solid ${colors.neutral[300]};
      transition: border-color 0.2s ease;
    }
    
    &:hover fieldset {
      border-color: ${colors.neutral[400]};
    }
    
    &.Mui-focused fieldset {
      border-color: ${colors.primary.main};
      box-shadow: ${shadows.focus};
    }
  }

  & .MuiSelect-select {
    padding: 14px 16px;
    font-size: ${typography.body};
    color: ${colors.neutral[800]};
    font-weight: 500;
  }

  & .MuiMenuItem-root {
    padding: 12px 16px;
    font-size: ${typography.body};
    color: ${colors.neutral[800]};
    
    &:hover {
      background: ${colors.primary.subtle};
    }
    
    &.Mui-selected {
      background: ${colors.primary.subtle};
      color: ${colors.primary.main};
      font-weight: 600;
    }
  }
`;

export const StyledSelect = styled(MuiSelect)`
  &.MuiInputBase-root {
    border-radius: ${borderRadius.md};
    background: white;
  }
`;

/* -------------------- Buttons -------------------- */

export const PrimaryButton = styled(MuiButton)`
  background: linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: ${borderRadius.md};
  font-size: ${typography.body};
  font-weight: 600;
  cursor: pointer;
  text-transform: none;
  box-shadow: ${shadows.md};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.lg};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${colors.neutral[300]};
    color: ${colors.neutral[500]};
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled(MuiButton)`
  background: white;
  color: ${colors.primary.main};
  border: 2px solid ${colors.primary.main};
  padding: 12px 28px;
  border-radius: ${borderRadius.md};
  font-size: ${typography.body};
  font-weight: 600;
  text-transform: none;
  box-shadow: none;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.primary.subtle};
    border-color: ${colors.primary.dark};
    color: ${colors.primary.dark};
    transform: translateY(-1px);
    box-shadow: ${shadows.md};
  }

  &:disabled {
    background: ${colors.neutral[100]};
    color: ${colors.neutral[400]};
    border-color: ${colors.neutral[300]};
    cursor: not-allowed;
  }
`;

export const CompactButton = styled(MuiButton)`
  background: white;
  color: ${colors.neutral[700]};
  border: 2px solid ${colors.neutral[300]};
  padding: 8px 20px;
  border-radius: 999px;
  font-size: ${typography.small};
  font-weight: 600;
  text-transform: none;
  min-width: 100px;
  box-shadow: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primary.main};
    color: ${colors.primary.main};
    background: ${colors.primary.subtle};
    transform: translateY(-1px);
  }

  &.active {
    background: linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%);
    color: white;
    border-color: transparent;
  }
`;

export const CompactContained = styled(MuiButton)`
  padding: 10px 20px;
  border-radius: ${borderRadius.md};
  min-width: 90px;
  font-size: ${typography.small};
  font-weight: 700;
  text-transform: none;
  background: ${colors.neutral[700]};
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral[800]};
    transform: translateY(-1px);
    box-shadow: ${shadows.md};
  }
`;

/* -------------------- Table & Filter toolbar -------------------- */

export const FilterToolbar = styled(Toolbar)`
  padding: ${spacing.lg};
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
  align-items: center;
  background: ${colors.neutral[50]};
  border-radius: ${borderRadius.lg};
  margin-bottom: ${spacing.lg};
  border: 1px solid ${colors.neutral[200]};
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};
  border: 1px solid ${colors.neutral[200]};
  background: white;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.neutral[100]};
    border-radius: 0 0 ${borderRadius.md} ${borderRadius.md};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.neutral[400]};
    border-radius: 4px;
    
    &:hover {
      background: ${colors.neutral[500]};
    }
  }
`;

/* -------------------- Additional Modern Components -------------------- */

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: ${typography.tiny};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: ${colors.success.subtle};
          color: ${colors.success.dark};
          border: 1px solid ${colors.success.light};
        `;
      case 'warning':
        return `
          background: ${colors.warning.subtle};
          color: ${colors.warning.dark};
          border: 1px solid ${colors.warning.light};
        `;
      case 'error':
        return `
          background: ${colors.error.subtle};
          color: ${colors.error.dark};
          border: 1px solid ${colors.error.light};
        `;
      default:
        return `
          background: ${colors.primary.subtle};
          color: ${colors.primary.dark};
          border: 1px solid ${colors.primary.light};
        `;
    }
  }}
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${colors.neutral[200]};
  border-top: 4px solid ${colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.neutral[500]};
  
  svg {
    font-size: 4rem;
    margin-bottom: ${spacing.md};
    opacity: 0.5;
  }
`;

export default {
  colors,
  shadows,
  typography,
  spacing,
  borderRadius
};