import { Typography } from "@mui/material";
import { StatsGrid, StatCard, StatNumber, StatLabel } from "../../../styles/budgeting.styles";

const BudgetStats = ({ stats }) => {
    return (
        <StatsGrid>
            {stats.map((stat) => (
                <StatCard key={stat.label} color={stat.color}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {stat.label}
                    </Typography>
                    <StatNumber color={stat.color}>{stat.value}</StatNumber>
                    <StatLabel>{stat.label}</StatLabel>
                </StatCard>
            ))}
        </StatsGrid>
    );
};

export default BudgetStats;
