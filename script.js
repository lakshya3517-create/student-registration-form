(function () {
  "use strict";

  const form = document.getElementById("regForm");
  const result = document.getElementById("result");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^[6-9]\d{9}$/;   // 10-digit Indian mobile number
  const namePattern = /^[A-Za-z][A-Za-z .'-]{1,59}$/;

  // Each validator returns an error message, or "" when the value is fine.
  const rules = {
    fullName(v) {
      if (!v) return "Enter your full name.";
      if (!namePattern.test(v)) return "Use letters only (2 to 60 characters).";
      return "";
    },
    dob(v) {
      if (!v) return "Select your date of birth.";
      const d = new Date(v), today = new Date();
      if (d > today) return "Date of birth cannot be in the future.";
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age < 15) return "Student must be at least 15 years old.";
      if (age > 60) return "Check the date of birth you entered.";
      return "";
    },
    gender() {
      return form.querySelector('input[name="gender"]:checked') ? "" : "Select a gender.";
    },
    email(v) {
      if (!v) return "Enter your email address.";
      if (!emailPattern.test(v)) return "Enter a valid email, like name@example.com.";
      return "";
    },
    phone(v) {
      if (!v) return "Enter your phone number.";
      if (!/^\d+$/.test(v)) return "Use digits only.";
      if (v.length !== 10) return "Phone number must be exactly 10 digits.";
      if (!phonePattern.test(v)) return "Number must start with 6, 7, 8 or 9.";
      return "";
    },
    course(v) { return v ? "" : "Select a course."; },
    year(v) { return v ? "" : "Select your year."; },
    terms() { return form.terms.checked ? "" : "Confirm the details to continue."; }
  };

  function validateField(name) {
    const el = form.elements[name];
    const value = el && el.value !== undefined && el.type !== "radio" ? el.value.trim() : "";
    const message = rules[name](value);
    const out = document.getElementById(name + "-error");
    out.textContent = message;

    // Highlight the input (radio groups and checkbox have no single box to colour)
    if (el && el.nodeType === 1 && el.type !== "checkbox") {
      el.classList.toggle("invalid", !!message);
      el.classList.toggle("valid", !message);
    }
    return !message;
  }

  // Validate on blur, and re-check live once a field has been touched
  Object.keys(rules).forEach((name) => {
    const el = form.elements[name];
    const nodes = el instanceof RadioNodeList ? Array.from(el) : [el];
    nodes.forEach((n) => {
      n.addEventListener("blur", () => validateField(name));
      n.addEventListener("input", () => {
        if (document.getElementById(name + "-error").textContent) validateField(name);
      });
      n.addEventListener("change", () => validateField(name));
    });
  });

  // Block non-digits while typing in the phone box
  form.phone.addEventListener("input", () => {
    form.phone.value = form.phone.value.replace(/\D/g, "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    Object.keys(rules).forEach((name) => {
      if (!validateField(name) && !firstBad) firstBad = name;
    });
    if (firstBad) {
      const target = form.elements[firstBad];
      (target instanceof RadioNodeList ? target[0] : target).focus();
      return;
    }
    showResult();
  });

  function showResult() {
    const data = {
      "Full name": form.fullName.value.trim(),
      "Date of birth": form.dob.value,
      "Gender": form.querySelector('input[name="gender"]:checked').value,
      "Email": form.email.value.trim(),
      "Phone": "+91 " + form.phone.value,
      "Address": form.address.value.trim() || "Not provided",
      "Course": form.course.value,
      "Year": form.year.value
    };

    document.getElementById("r-name").textContent = data["Full name"];
    const list = document.getElementById("r-list");
    list.innerHTML = "";
    Object.entries(data).forEach(([k, v]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = k;
      dd.textContent = v;          // textContent prevents HTML injection
      list.append(dt, dd);
    });

    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetUI() {
    form.querySelectorAll(".error").forEach((n) => (n.textContent = ""));
    form.querySelectorAll(".invalid, .valid").forEach((n) => n.classList.remove("invalid", "valid"));
  }

  form.addEventListener("reset", resetUI);

  document.getElementById("newBtn").addEventListener("click", () => {
    form.reset();
    resetUI();
    result.hidden = true;
    form.hidden = false;
    form.fullName.focus();
  });
})();
