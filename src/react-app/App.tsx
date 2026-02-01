import React from "react";
import ChatWidget from "./ChatWidget";

export default function App() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <img
            src="/logo.svg"
            alt="Easters Digital Ecosystem Logo"
            className="logo"
            width={120}
            height={120}
          />
          <h1>Easters.live</h1>
          <p className="tagline">
            Practical reselling playbooks and AI tools that help you build real side-hustle income.
          </p>
          <div className="cta-buttons">
            <a href="/newsletter/" className="btn gold">
              Join the Newsletter
            </a>
            <a href="/reselling/" className="btn outline">
              Explore Reselling
            </a>
          </div>
          <p className="subtag">Repeatable systems • Smarter listings • Faster workflows</p>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h3>Reselling</h3>
          <p>Step-by-step playbooks for sourcing, pricing, listing, shipping, and scaling your flips.</p>
          <a href="/reselling/">Explore Reselling →</a>
        </section>

        <section className="card">
          <h3>AI Tools for Side Hustles</h3>
          <p>
            Prompts, workflows, and automations that help you write better listings, analyze items, and
            save time.
          </p>
          <a href="/ai/">Explore AI →</a>
        </section>

        <section className="card card-accent">
          <h3>Get the Weekly Playbook</h3>
          <p>One email per week with frameworks, checklists, and tools you can use right away.</p>
          <a href="/newsletter/">Subscribe →</a>
          <p className="micro">Start with the Reselling + AI onboarding sequence.</p>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Easters.live | Built for creators, hustlers, and builders.</p>
          <nav>
            <a href="/about/">About</a> | <a href="/contact/">Contact</a> |{" "}
            <a href="/privacy/">Privacy Policy</a> | <a href="/terms/">Terms</a>
          </nav>
        </div>
      </footer>

      <ChatWidget />
    </>
  );
}
