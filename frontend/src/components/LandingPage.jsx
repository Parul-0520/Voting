import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const steps = [
    { number: '01', title: 'Admin Registers', desc: 'Anyone can register and become an admin. Create your voting options with categories.' },
    { number: '02', title: 'Approve Voters', desc: 'Admin adds approved email IDs and sets a common password for their voters.' },
    { number: '03', title: 'Voters Login', desc: 'Approved voters login using their email and the common password given by admin.' },
    { number: '04', title: 'Vote & Results', desc: 'Voters cast their vote. Results update in real-time. Admin sees live charts and voter list.' },
  ];

  const features = [
    { icon: '⚡', title: 'Real-Time Updates', desc: 'Votes reflect instantly across all screens using WebSocket technology.' },
    { icon: '🔐', title: 'Access Control', desc: 'Only admin-approved email IDs can participate in voting.' },
    { icon: '🗂️', title: 'Category Voting', desc: 'Organize candidates into categories. One vote per category per voter.' },
    { icon: '📊', title: 'Live Results', desc: 'Admin sees pie charts, vote counts, and voter lists in real time.' },
    { icon: '🌐', title: 'Multi-Admin', desc: 'Multiple admins can run separate independent voting sessions simultaneously.' },
    { icon: '🛡️', title: 'Secure & Fair', desc: 'JWT authentication ensures every vote is counted once, fairly.' },
  ];

  return (
    <div className='landing-page'>

      <section className='landing-hero'>
        <h1 className='landing-title'>
          Real-Time Voting,<br />
          <span className='landing-accent'>Done Right.</span>
        </h1>
        <p className='landing-subtitle'>
          A transparent, controlled voting platform where admins manage access
          and results update live — built for communities, societies, and teams.
        </p>
        <p className='landing-creator'>Created by <strong>Parul Sharma</strong></p>
        <div className='landing-cta'>
          <Link to='/register' className='auth-link'>Get Started as Admin</Link>
          {/* <Link to='/voter-login' className='auth-link voter-cta-btn'>Login as Voter</Link> */}
        </div>
      </section>

      <section className='landing-section'>
        <div className='landing-two-col'>
          <div className='vote-card'>
            <div className='landing-tag'>The Problem</div>
            <h2 className='landing-card-title'>Why does this exist?</h2>
            <p className='createdBy' style={{fontSize: '1rem', lineHeight: '1.7'}}>
              Traditional voting in societies, colleges, and communities is messy —
              paper ballots get lost, Google Forms have no access control, and results
              take time. There was no simple tool that let an organizer control exactly
              who votes, show results live, and keep everything secure.
            </p>
          </div>
          <div className='vote-card'>
            <div className='landing-tag'>The Solution</div>
            <h2 className='landing-card-title'>What does it solve?</h2>
            <p className='createdBy' style={{fontSize: '1rem', lineHeight: '1.7'}}>
              This platform gives any organizer the power to run a controlled,
              transparent vote — approve only the right people, create candidates
              by category, and watch results update in real time. No spreadsheets,
              no paper, no confusion.
            </p>
          </div>
        </div>
      </section>

      <section className='landing-section'>
        <div className='landing-section-header'>
          <div className='landing-tag'>How It Works</div>
          <h2 className='landing-section-title'>4 simple steps</h2>
        </div>
        <div className='votes-grid'>
          {steps.map((step) => (
            <div className='vote-card' key={step.number}>
              <div className='landing-step-number'>{step.number}</div>
              <h3 className='vote-card-h3'>{step.title}</h3>
              <p className='createdBy'>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className='landing-section'>
        <div className='landing-section-header'>
          <div className='landing-tag'>Features</div>
          <h2 className='landing-section-title'>What you get</h2>
        </div>
        <div className='votes-grid'>
          {features.map((f) => (
            <div className='vote-card' key={f.title}>
              <div className='landing-feature-icon'>{f.icon}</div>
              <h3 className='vote-card-h3'>{f.title}</h3>
              <p className='createdBy'>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Output */}
      <section className='landing-section'>
        <div className='landing-section-header'>
          <div className='landing-tag'>Output</div>
          <h2 className='landing-section-title'>What do you get at the end?</h2>
        </div>
        <div className='current-options'>
          {[
            'Live vote counts per candidate',
            'Pie chart results per category',
            'Full voter list — who voted for whom',
            'Winner clearly visible from vote count',
          ].map((item, i) => (
            <div className='option-item' key={i}>
              <span>✅ {item}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
