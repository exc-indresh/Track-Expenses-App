import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Grid, useMediaQuery } from "@mui/material";
import axios from 'axios';

const columns = [
    { id: 'category', label: 'Category' },
    { id: 'amount', label: 'Amount (Rs)' },
    { id: 'date', label: 'Date' },
    { id: 'description', label: 'Description' },
];

const ExpenseTracker = () => {
    const [expenses, setExpenses] = useState([]);
    const [form, setForm] = useState({ amount: '', category: '', date: '', description: '' });
    const [filter, setFilter] = useState({ category: '', date: '' });
    const [total, setTotal] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        axios.get('http://localhost:5000/expenses')
            .then(response => setExpenses(response.data))
            .catch(error => console.error("Error fetching expenses:", error));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });
    const handleDateRangeChange = (e) => setDateRange({ ...dateRange, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            const newExpense = {
                amount: form.amount,
                category: form.category,
                date: form.date,
                description: form.description
            };
            const response = await axios.post('http://localhost:5000/expenses', newExpense);
            setExpenses([...expenses, response.data]);
            setForm({ amount: '', category: '', date: '', description: '' });
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const handleFilterExpenses = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/expenses?category=${filter.category}&date=${filter.date}`);
            setExpenses(response.data);
        } catch (error) {
            console.error("Error filtering expenses:", error);
        }
    };

    const handleGetTotal = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/expenses/total?start=${dateRange.start}&end=${dateRange.end}`);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching total expenses:", error);
        }
    };

    const handleChangePage = (newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const isMobile = useMediaQuery("(max-width:600px)");

    return (
        <>
            <Box display="flex" justifyContent="center" flexDirection={"column"} alignItems={"center"}>

                <h1 style={{ textDecoration: 'underline' }}>Track Your Expenses</h1>
                <Box component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: "100%" },
                        boxShadow: '4px 4px 10px gray',
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        width: { xs: "90%", sm: "60%", md: "40%", lg: "35%" }
                    }}
                    display="flex"
                    flexDirection="column"
                >
                    <TextField id="category" label="Category" name="category" value={form.category} onChange={handleChange} />
                    <TextField id="amount" label="Amount (Rs)" name="amount" type='number' value={form.amount} onChange={handleChange} />
                    <TextField id="date" name="date" type='date' value={form.date} onChange={handleChange} />
                    <TextField id="description" label="Description" name="description" value={form.description} onChange={handleChange} />
                    <Button variant="contained" size='large' sx={{ mt: 2 }} onClick={handleSubmit}>Add</Button>
                </Box>
            </Box>

            {expenses.length > 0 ? (
                <>
                    <hr style={{ margin: '30px 5px' }} />
                    <div style={{ margin: '30px' }}>
                        <Grid container spacing={3} sx={{ marginBottom: 3 }}>
                            <Grid item xs={12} md={6}>
                                <h3 style={{ fontWeight: 'bold' }}>Filter Expenses</h3>
                                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                                    <TextField fullWidth id="category" label="Category" name="category" value={filter.category} onChange={handleFilterChange} />
                                    <TextField fullWidth id="date" name="date" type="date" value={filter.date} onChange={handleFilterChange} />
                                    <Button variant="contained" size="large" fullWidth={isMobile} onClick={handleFilterExpenses}>Filter</Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <h3 style={{ fontWeight: 'bold' }}>Get Total Expenses</h3>
                                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                                    <TextField fullWidth id="start" name="start" type="date" value={dateRange.start} onChange={handleDateRangeChange} />
                                    <TextField fullWidth id="end" name="end" type="date" value={dateRange.end} onChange={handleDateRangeChange} />
                                    <Button variant="contained" size="large" fullWidth={isMobile} onClick={handleGetTotal}>Get</Button>
                                </Box>
                                {total !== null && <h4 style={{ marginTop: "10px" }}>Total Expenses: Rs {total}</h4>}
                            </Grid>
                        </Grid>

                        <Box>
                            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
                                <TableContainer sx={{ maxHeight: 440 }}>
                                    <Table stickyHeader aria-label="customized table">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                                {columns.map((column) => (
                                                    <TableCell
                                                        key={column.id}
                                                        sx={{
                                                            fontSize: '1rem',
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            backgroundColor: '#1976d2'
                                                        }}
                                                    >
                                                        {column.label}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expenses.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#757575' }}>
                                                        No Expenses Added Yet
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                expenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                                                            '&:hover': { backgroundColor: '#e3f2fd' },
                                                        }}
                                                    >
                                                        {columns.map((column) => (
                                                            <TableCell key={column.id} sx={{ padding: '12px', fontSize: '0.95rem' }}>
                                                                {column.id === 'description' ? (
                                                                    <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-line', maxWidth: '250px', display: 'block' }}>
                                                                        {row[column.id]}
                                                                    </span>
                                                                ) : (
                                                                    row[column.id]
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 100]}
                                    component="div"
                                    count={expenses.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </Paper>
                        </Box>
                    </div>
                </>
            ) :
                <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#757575' }}>
                        No Expenses Added Yet
                    </TableCell>
                </TableRow>
            }


        </>
    );
};
export default ExpenseTracker;
