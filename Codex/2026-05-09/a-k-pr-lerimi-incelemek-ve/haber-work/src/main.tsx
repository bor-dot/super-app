import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './liveNewsStabilityFix';
import './homeDetailResetFix';
import './siteBehaviorFix';
import './latestSeeAllPriorityFix';
import './categoryScrollFix';
import './categoryViewLightFix';
import './latestSeeAllFix';
import './logoArchFix';
import './logoMarkModernFix';
import './turkishTextFix';
import './detailSummaryFix';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
