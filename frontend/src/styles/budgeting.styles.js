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

/* -------------------- Layout / Stat components -------------------- */

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin: 32px 0;
`;

export const StatCard = styled(Card)`
  padding: 28px;
  border-radius: 16px;
  text-align: center;
  border-left: 6px solid ${(props) => props.color};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
`;

export const StatNumber = styled(Typography)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: ${(p) => p.color || "#1a202c"};
`;

export const StatLabel = styled.div`
  color: #718096;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
`;

/* -------------------- Section / Card -------------------- */

export const SectionCard = styled(Card)`
  margin-bottom: 32px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

export const SectionTitle = styled.h2`
  color: #1a202c;
  margin-bottom: 28px;
  font-size: 1.75rem;
  font-weight: 700;
  border-bottom: 2px solid #f1f3f9;
  padding-bottom: 12px;
`;

/* -------------------- Form grid -------------------- */

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;

  /* make last button align nicely - it will be the last grid item */
`;

/* -------------------- Inputs & Selects (MUI overrides) -------------------- */

/*
  StyledTextField and StyledSelect are wrappers around MUI components.
  They mirror the 'rounded, soft-border, focused outline' style from your CSS example.
*/

export const StyledTextField = styled(MuiTextField)`
  & .MuiOutlinedInput-root {
    border-radius: 10px;
    background: white;
    fieldset {
      border: 2px solid #e2e8f0;
    }
    &:hover fieldset {
      border-color: #cbd5e0;
    }
    &.Mui-focused fieldset {
      border-color: #667eea;
      box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.06);
    }
    input,
    textarea {
      padding: 14px;
      font-size: 1rem;
    }
  }

  & .MuiInputLabel-root {
    font-weight: 600;
    color: #2d3748;
  }

  & .MuiInputLabel-shrink {
    transform: translate(14px, -9px) scale(0.85); /* optional fine-tuning */
  }

  & .MuiFormHelperText-root {
    color: #718096;
  }
`;


export const StyledFormControl = styled(MuiFormControl)`
  & .MuiInputLabel-root {
    font-weight: 600;
    color: #2d3748;
  }

  & .MuiOutlinedInput-root {
    border-radius: 10px;
    background: white;
    fieldset {
      border: 2px solid #e2e8f0;
    }
    &:hover fieldset {
      border-color: #cbd5e0;
    }
    &.Mui-focused fieldset {
      border-color: #667eea;
      box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.06);
    }
  }

  /* target Select's internal display */
  & .MuiSelect-select {
    padding: 12px 14px;
    font-size: 1rem;
  }
`;

export const StyledSelect = styled(MuiSelect)`
  &.MuiInputBase-root {
    border-radius: 10px;
    background: white;
  }
`;

/* -------------------- Buttons -------------------- */

/* Main primary button — gradient & raised */
export const PrimaryButton = styled(MuiButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: none;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.18);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.24);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e0;
    color: #ffffff;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

/* Compact button for toolbar/filter area */
export const CompactButton = styled(MuiButton)`
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: none;
  min-width: 90px;
  box-shadow: none;
  transition: all 0.18s ease;

  &:hover {
    border-color: #667eea;
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: translateY(-2px);
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
  }
`;

/* Compact contained variant (for Filter button that stays small) */
export const CompactContained = styled(MuiButton)`
  padding: 8px 12px;
  border-radius: 10px;
  min-width: 80px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: none;
`;

/* -------------------- Table & Filter toolbar -------------------- */

export const FilterToolbar = styled(Toolbar)`
  padding: 16px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 16px;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

/* export default group style names if helpful */
