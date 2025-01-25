// Main app initialization
class PortfolioApp {
  constructor() {
      this.navToggle = document.querySelector(".nav-toggle");
      this.navLinks = document.querySelector(".nav-links");
      this.sections = document.querySelectorAll(".section");
      this.progressBar = document.querySelector(".scroll-progress");
      this.themeToggle = document.querySelector(".theme-toggle");
      
      this.initializeEventListeners();
      this.initializeIntersectionObserver();
      this.initializeScrollProgress();
      this.checkBrowserCompatibility();
  }

  initializeEventListeners() {
      // Mobile Navigation
      this.navToggle?.addEventListener("click", () => this.toggleMobileNav());

      // Smooth Scrolling
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener("click", (e) => this.handleSmoothScroll(e));
      });

      // Resume Download
      document.querySelectorAll(".resume-btn").forEach(button => {
          button.addEventListener("click", (e) => this.handleResumeDownload(e));
      });

      // Theme Toggle
      this.themeToggle?.addEventListener("click", () => this.toggleTheme());

      // Scroll Events
      window.addEventListener("scroll", () => this.handleScroll(), { passive: true });

      // Handle clicks outside mobile nav to close it
      document.addEventListener("click", (e) => {
          if (this.navLinks?.classList.contains("active") && 
              !e.target.closest(".nav-links") && 
              !e.target.closest(".nav-toggle")) {
              this.navLinks.classList.remove("active");
          }
      });
  }

  // Mobile Navigation Toggle
  toggleMobileNav() {
      this.navLinks?.classList.toggle("active");
      this.navToggle?.setAttribute(
          "aria-expanded",
          this.navLinks?.classList.contains("active")
      );
  }

  // Smooth Scrolling Handler
  handleSmoothScroll(e) {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
          const headerOffset = 80; // Adjust based on your header height
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
          });

          // Update URL without scrolling
          history.pushState(null, "", targetId);

          // Close mobile nav if open
          this.navLinks?.classList.remove("active");
      }
  }

  // Resume Download Handler
  handleResumeDownload(e) {
      e.preventDefault();
      try {
          const resumePath = "/path/to/your/resume.pdf";
          // Check if file exists before opening
          fetch(resumePath, { method: "HEAD" })
              .then(response => {
                  if (response.ok) {
                      window.open(resumePath, "_blank");
                  } else {
                      throw new Error("Resume file not found");
                  }
              })
              .catch(error => {
                  console.error("Error downloading resume:", error);
                  this.showNotification("Resume download failed. Please try again later.", "error");
              });
      } catch (error) {
          console.error("Error in resume download:", error);
          this.showNotification("An error occurred. Please try again later.", "error");
      }
  }

  // Intersection Observer Setup
  initializeIntersectionObserver() {
      const observerOptions = {
          threshold: 0.1,
          rootMargin: "0px 0px -10% 0px"
      };

      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add("animate");
                  this.updateActiveNavLink(entry.target.id);
              }
          });
      }, observerOptions);

      this.sections.forEach(section => observer.observe(section));
  }

  // Scroll Progress Bar
  initializeScrollProgress() {
      if (this.progressBar) {
          window.addEventListener("scroll", () => {
              const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
              const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
              const scrolled = (winScroll / height) * 100;
              this.progressBar.style.width = scrolled + "%";
          }, { passive: true });
      }
  }

  // Update Active Navigation Link
  updateActiveNavLink(sectionId) {
      document.querySelectorAll(".nav-links a").forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
          }
      });
  }

  // Theme Toggle
  toggleTheme() {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      
      this.showNotification(`Switched to ${newTheme} theme`, "info");
  }

  // Notification System
  showNotification(message, type = "info") {
      const notification = document.createElement("div");
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Trigger animation
      setTimeout(() => notification.classList.add("show"), 10);
      
      // Remove notification
      setTimeout(() => {
          notification.classList.remove("show");
          setTimeout(() => notification.remove(), 300);
      }, 3000);
  }

  // Browser Compatibility Check
  checkBrowserCompatibility() {
      const features = {
          intersectionObserver: "IntersectionObserver" in window,
          smoothScroll: "scrollBehavior" in document.documentElement.style,
          gridLayout: window.CSS && CSS.supports("display", "grid")
      };

      const unsupportedFeatures = Object.entries(features)
          .filter(([, supported]) => !supported)
          .map(([feature]) => feature);

      if (unsupportedFeatures.length > 0) {
          console.warn("Unsupported features:", unsupportedFeatures);
          this.showNotification(
              "Some features may not work in your browser. Please consider updating.",
              "warning"
          );
      }
  }

  // Scroll Event Handler
  handleScroll() {
      // Debounced scroll handling
      if (!this.scrollTimeout) {
          this.scrollTimeout = setTimeout(() => {
              // Add header shadow on scroll
              const header = document.querySelector(".navbar");
              if (header) {
                  header.classList.toggle("scrolled", window.scrollY > 50);
              }
              
              this.scrollTimeout = null;
          }, 50);
      }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
      window.portfolioApp = new PortfolioApp();
  } catch (error) {
      console.error("Error initializing portfolio app:", error);
  }
});

// Handle service worker for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(error => {
          console.error("ServiceWorker registration failed:", error);
      });
  });
}