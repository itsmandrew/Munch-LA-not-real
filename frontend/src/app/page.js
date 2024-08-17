import styles from "./page.module.css";
import Grid from '@mui/material/Grid';
import ChatBox from './components/chatbot';

export default function Home() {
  return (
    <div className="App" style={{ height: '100vh', width: '100vw' }}>
      <Grid container style={{ height: '100%' }}>
        <Grid item xs={12} md={2} style={{ backgroundColor: '#f0f0f0' }}>
          <div>
            SIDE PANEL
          </div>
        </Grid>
        <Grid item xs={12} md={10} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ height: '100%', width: '100%' }}>
            <ChatBox />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
