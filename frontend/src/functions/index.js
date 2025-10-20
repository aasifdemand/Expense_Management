export const getCurrentDateRange = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
};

export const handleDepartmentChange = (departmentId) => {
    setFilter({
        ...filter,
        department: departmentId,
        subDepartment: 'all' // Reset sub-department when main department changes
    });

    if (departmentId && departmentId !== 'all') {
        dispatch(fetchSubDepartments(departmentId));
    }
};



