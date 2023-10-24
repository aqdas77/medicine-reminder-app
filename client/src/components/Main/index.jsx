import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import InputLabel from "@mui/material/InputLabel";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Clock from "react-clock";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { TimeField } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Main = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [selectedReminderForEdit, setSelectedReminderForEdit] = useState(null);
  const [selectedReminderToDelete, setSelectedReminderToDelete] =
    useState(null);
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const amOrPm = currentHours >= 12 ? "PM" : "AM";
  const formattedHours = currentHours % 12 || 12; // Convert 0 to 12 for AM
  const currentTime = `${formattedHours
    .toString()
    .padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")} ${amOrPm}`;

  const [selectedTime, setSelectedTime] = useState(null);
  const [data, setData] = useState({
    title: "", // Title field
    dosage: "", // Dosage field
    caretakerEmail: "", // Caretaker Email field
    caretakerMobileNumber: "", // Caretaker Mobile Number field
    frequency: 6, // Default frequency (you can set it to any initial value you prefer)
    time: "", // Default time (you can set it to any initial value you prefer)
  });

  const handleTimeChange = (e) => {
    // console.log(e)
    const dateString = e.$d;
    const date = new Date(dateString);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const newTime = {
      hour: hours,
      minute: minutes,
      second: seconds,
    };

    setData({
      ...data,
      time: newTime,
    });
  };
  useEffect(() => {
    console.log("new time:", data.time);
  }, [data.time]);
  const { hour, minute, second } = data.time;
  const frequencies = Array.from({ length: 12 }, (_, i) => i + 1);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const createReminder = async (e) => {
    e.preventDefault();

    try {
      const url = "http://localhost:8080/api/reminders";
      const token = localStorage.getItem("token");

      const res = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201) {
        setIsFormOpen(false);
        alert("Reminder created successfully");
        // Refresh the reminder list
        fetchReminders();
      } else {
        alert("Failed to create Reminder. Please check your input.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  const handleEditTimeChange = (e)=>{
    const dateString = e.$d;
    const date = new Date(dateString);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const newTime = {
      hour: hours,
      minute: minutes,
      second: seconds,
    };
    
    setSelectedReminderForEdit({
      ...selectedReminderForEdit,
      time: newTime,
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const fetchReminders = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/reminders", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((response) => {
        setReminders(response.data);
      })
      .catch((error) => {
        console.error("Error fetching reminders:", error);
      });
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Function to open the edit dialog for a reminder
  const openEdit = (reminder) => {
    setSelectedReminderForEdit(reminder);
  };

  // Function to close the edit dialog
  const closeEdit = () => {
    setSelectedReminderForEdit(null);
  };

  const selectReminderForDeletion = (reminder) => {
    setSelectedReminderToDelete(reminder);
  };
  // Function to handle updating a reminder
  const handleUpdate = async () => {
    if (!selectedReminderForEdit) return;

    try {
      const url = `http://localhost:8080/api/reminders/${selectedReminderForEdit._id}`;
      const token = localStorage.getItem("token");

      const res = await axios.put(url, selectedReminderForEdit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        // reminder updated successfully
        alert("Reminder updated successfully");
        closeEdit(); // Close the edit dialog
        fetchReminders(); // Refresh the reminder list
      } else {
        alert("Failed to update reminder. Please check your input.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  // Function to handle deleting a reminder
  const handleDelete = async () => {
    if (!selectedReminderToDelete) return;

    try {
      const url = `http://localhost:8080/api/reminders/${selectedReminderToDelete._id}`;
      const token = localStorage.getItem("token");

      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert("Reminder deleted successfully");

        // Refresh the reminder list
        fetchReminders();
        setSelectedReminderToDelete(null); // Clear the selected reminder for deletion
      } else {
        alert("Failed to delete reminder.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            ></IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Home
            </Typography>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Container
        style={{ maxWidth: "lg", marginTop: "2rem", marginBottom: "2rem" }}
      >
        <Button variant="outlined" onClick={openForm}>
          Create Reminder
        </Button>

        <Dialog open={isFormOpen} onClose={closeForm}>
          <DialogTitle>Reminder Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel>Title</InputLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  placeholder="Reminder title..."
                  fullWidth
                  variant="outlined"
                  name="title" // Update the name to match the schema field
                  value={data.title} // Update the value to match the schema field
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Dosage</InputLabel>
                <TextareaAutosize
                  minRows={3}
                  placeholder="Dosage details..."
                  style={{ width: "100%" }}
                  name="dosage" // Update the name to match the schema field
                  value={data.dosage} // Update the value to match the schema field
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Caretaker Email</InputLabel>
                <TextField
                  margin="dense"
                  placeholder="Caretaker's email..."
                  fullWidth
                  variant="outlined"
                  name="caretakerEmail"
                  value={data.caretakerEmail}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Caretaker Mobile Number</InputLabel>
                <TextField
                  margin="dense"
                  placeholder="Caretaker's mobile number..."
                  fullWidth
                  variant="outlined"
                  name="caretakerMobileNumber"
                  value={data.caretakerMobileNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Frequency(in hours)</InputLabel>
                <Select
                  fullWidth
                  variant="outlined"
                  name="frequency"
                  value={data.frequency}
                  onChange={handleChange}
                >
                  {frequencies.map((frequency) => (
                    <MenuItem key={frequency} value={frequency}>
                      {frequency}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Time</InputLabel>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["TimeField", "TimeField"]}>
                    <TimeField
                      value={selectedTime}
                      onChange={handleTimeChange}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={closeForm} color="primary">
              Cancel
            </Button>
            <Button variant="outlined" onClick={createReminder} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Container>
        <h1>Reminders :</h1>
        <Grid container spacing={2}>
          {reminders && reminders !== undefined && reminders.length > 0 ? (
            reminders.map((reminder) => (
              <Grid item xs={12} sm={6} md={4} key={reminder._id}>
                <Card
                  sx={{
                    maxWidth: 345,
                    height: 270,
                    border: "0.1px solid gray",
                    color: "text.primary",
                    borderRadius: "8px",

                    transition: "background-color 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      border: "white",
                      backgroundColor: "#e8f4f8",
                      boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                      {reminder.title}
                    </Typography>
                    <h5>Dosage :</h5>
                    <Typography variant="body2" color="text.secondary">
                      {reminder.dosage}
                    </Typography>
                    <h5>Caretaker Details :</h5>
                    <Typography variant="body2" color="text.secondary">
                      {reminder.caretakerEmail}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reminder.caretakerMobileNumber}
                    </Typography>
                    
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openEdit(reminder)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        selectReminderForDeletion(reminder);
                        handleDelete();
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Container sx={{ marginTop: 2 }}>No reminders to show...</Container>
          )}
        </Grid>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={!!selectedReminderForEdit} onClose={closeEdit}>
        <DialogTitle>Edit Reminder</DialogTitle>
        <DialogContent>
          {selectedReminderForEdit && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel>Title</InputLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  fullWidth
                  variant="outlined"
                  name="title"
                  value={selectedReminderForEdit.title}
                  onChange={(e) =>
                    setSelectedReminderForEdit({
                      ...selectedReminderForEdit,
                      title: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Dosage</InputLabel>
                <TextareaAutosize
                  minRows={3}
                  style={{ width: "100%" }}
                  name="dosage"
                  value={selectedReminderForEdit.dosage}
                  onChange={(e) =>
                    setSelectedReminderForEdit({
                      ...selectedReminderForEdit,
                      dosage: e.target.value,
                    })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <InputLabel>Caretaker Email</InputLabel>
                <TextField
                  margin="dense"
                  placeholder="Caretaker's email..."
                  fullWidth
                  variant="outlined"
                  name="caretakerEmail"
                  value={selectedReminderForEdit.caretakerEmail}
                  onChange={(e) =>
                    setSelectedReminderForEdit({
                      ...selectedReminderForEdit,
                      caretakerEmail: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Caretaker Mobile Number</InputLabel>
                <TextField
                  margin="dense"
                  placeholder="Caretaker's mobile number..."
                  fullWidth
                  variant="outlined"
                  name="caretakerMobileNumber"
                  value={selectedReminderForEdit.caretakerMobileNumber}
                  onChange={(e) =>
                    setSelectedReminderForEdit({
                      ...selectedReminderForEdit,
                      caretakerMobileNumber: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  fullWidth
                  variant="outlined"
                  name="frequency"
                  value={selectedReminderForEdit.frequency}
                  onChange={(e) =>
                    setSelectedReminderForEdit({
                      ...selectedReminderForEdit,
                      frequency: e.target.value,
                    })
                  }
                >
                  {frequencies.map((frequency) => (
                    <MenuItem key={frequency} value={frequency}>
                      {frequency}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Time</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["TimeField", "TimeField"]}>
                    <TimeField
                      value={selectedTime}
                      onChange={handleEditTimeChange}
                    />
                  </DemoContainer>
                </LocalizationProvider>
               
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleUpdate} color="primary">
            Update
          </Button>
          <Button variant="outlined" onClick={closeEdit} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Main;
