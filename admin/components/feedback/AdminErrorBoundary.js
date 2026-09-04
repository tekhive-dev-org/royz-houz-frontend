import { Component } from "react";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";
import styles from "./AdminErrorBoundary.module.css";

export class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box className={styles.page}>
        <Paper component="section" elevation={0} className={styles.card} aria-labelledby="admin-error-title">
          <Typography id="admin-error-title" component="h1" variant="h5" className={styles.title}>
            We could not display this admin area
          </Typography>
          <Typography variant="body2" className={styles.description}>
            Your session and data have not been changed. Try again, or return to the dashboard.
          </Typography>
          <Button startIcon={<RefreshOutlinedIcon />} onClick={this.handleRetry} variant="contained" className={styles.action}>
            Try again
          </Button>
        </Paper>
      </Box>
    );
  }
}
