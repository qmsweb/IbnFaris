(function () {
  "use strict";

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LAUNCH_DATE = new Date("2026-12-01T20:00:00+03:00");

  function prefersReducedMotion() {
    return reduceQuery.matches;
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var header = document.getElementById("siteHeader");
  if (header) {
    var syncHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 6);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  var menuBtn = document.getElementById("menuBtn");
  var mobileNav = document.getElementById("mobileNav");

  if (menuBtn && mobileNav) {
    var closeMenu = function (restoreFocus) {
      mobileNav.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "فتح القائمة");
      if (restoreFocus) {
        menuBtn.focus();
      }
    };

    var openMenu = function () {
      mobileNav.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "إغلاق القائمة");
    };

    menuBtn.addEventListener("click", function () {
      if (mobileNav.hidden) {
        openMenu();
      } else {
        closeMenu(false);
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuBtn.contains(event.target)) {
        closeMenu(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !mobileNav.hidden) {
        closeMenu(true);
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 861px)");
    var onDesktopChange = function (event) {
      if (event.matches) {
        closeMenu(false);
      }
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", onDesktopChange);
    }
  }

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (revealItems.length) {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    }
  }

  var typingTimers = new WeakMap();

  function stopTyping(element) {
    var timer = typingTimers.get(element);
    if (timer) {
      window.clearInterval(timer);
      typingTimers.delete(element);
    }
    element.classList.remove("is-typing");
  }

  function typeText(element, text, speed, onDone) {
    stopTyping(element);
    element.textContent = "";

    if (prefersReducedMotion()) {
      element.textContent = text;
      if (typeof onDone === "function") {
        onDone();
      }
      return;
    }

    element.classList.add("is-typing");
    var index = 0;
    var timer = window.setInterval(function () {
      index += 2;
      element.textContent = text.slice(0, index);

      if (index >= text.length) {
        window.clearInterval(timer);
        typingTimers.delete(element);
        element.textContent = text;
        element.classList.remove("is-typing");
        if (typeof onDone === "function") {
          onDone();
        }
      }
    }, speed);

    typingTimers.set(element, timer);
  }

  var demoAnswers = {
    metaphor: {
      text:
        "التشبيهُ يربط بين شيئين بأداةٍ ظاهرة، فنقول: «العلمُ كالنور». أمّا الاستعارةُ فتتجاوز الأداة، وتمنح الصورة قوّةً أكبر: «العلمُ نورٌ يهدي صاحبه».\n\nفي الأولى نقول: هذا يشبه ذاك. وفي الثانية نُسقط المشبَّه به، ونُلبس المعنى ثوبه، فتزداد الصورة كثافةً وجمالًا."
    },
    summary: {
      text:
        "الذكاء الاصطناعي التوليدي جيلٌ من النماذج يتعلّم الأنماط من كمٍّ هائل من البيانات، ثم يستخدمها لإنشاء محتوى جديد: نصٍّ، أو صورةٍ، أو صوت.\n\nلا يبحث عن إجابةٍ محفوظة، بل يولّدها لحظة الطلب. ولهذا يُبدع أحيانًا، ويخطئ أحيانًا، ويحتاج دائمًا إلى مراجعةٍ بشرية."
    },
    rewrite: {
      text:
        "نسعى إلى أن تكون تجربتك معنا أوضح، وأسرع، وأكثر إنسانية — من أول خطوة حتى آخرها.\n\nحذفنا التكرار، وقدّمنا الفعل، وجعلنا النبرة أقرب إلى القارئ."
    },
    beauty: {
      text:
        "في العربية مساحةٌ للدهشة: كلمةٌ واحدة قد تحمل سرّ اشتقاقها، وحرفٌ يغيّر معنى جملةٍ كاملة. هي لغةٌ تحفظ الذاكرة في جذورها، وتترك للخيال بابًا في مجازها.\n\nولهذا لم تكن يومًا مجرّد وسيلة تواصل، بل طريقةً في رؤية العالم."
    }
  };

  function normalizeArabic(value) {
    return String(value)
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findDemoAnswer(query) {
    var normalized = normalizeArabic(query);

    if (/استعار|تشبيه|بلاغ/.test(normalized)) {
      return demoAnswers.metaphor;
    }
    if (/لخص|تلخيص|توليد/.test(normalized)) {
      return demoAnswers.summary;
    }
    if (/صياغ|جمل|نص/.test(normalized)) {
      return demoAnswers.rewrite;
    }
    if (/جمال|عربي|لغه|فقره|شعر/.test(normalized)) {
      return demoAnswers.beauty;
    }

    var shortQuery = query.length > 90 ? query.slice(0, 90) + "…" : query;

    return {
      text:
        "سؤالك عن «" +
        shortQuery +
        "» يستحق إجابة كاملة.\n\nهذه معاينة توضيحية على صفحة الإطلاق، ولا تتصل بنموذج حقيقي بعد. جرّب أحد الأسئلة الجاهزة أعلاه لترى أسلوب ابن فارس، أو انضم إلى الوصول المبكر لتكون أول من يجرّبه."
    };
  }

  var askForm = document.getElementById("askForm");
  var askInput = document.getElementById("askInput");
  var answerBox = document.getElementById("answer");
  var answerBody = document.getElementById("answerBody");
  var demoLive = document.getElementById("demoLive");
  var askReset = document.getElementById("askReset");
  var demoChips = Array.prototype.slice.call(document.querySelectorAll(".prompt-chips .chip"));
  var suggestionCards = Array.prototype.slice.call(document.querySelectorAll(".suggestion-card"));

  function setActiveChip(activeChip) {
    demoChips.forEach(function (chip) {
      chip.classList.toggle("is-active", chip === activeChip);
    });
  }

  function chipForKey(key) {
    return demoChips.find(function (chip) {
      return chip.getAttribute("data-answer") === key;
    });
  }

  function scrollToAnswerOnMobile() {
    if (window.innerWidth <= 700) {
      window.requestAnimationFrame(function () {
        answerBox.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center"
        });
      });
    }
  }

  function runDemo(prompt, key, activeChip) {
    if (!askForm || !askInput || !answerBox || !answerBody) {
      return;
    }

    askInput.value = prompt;
    setActiveChip(activeChip || null);

    var result = (key && demoAnswers[key]) || findDemoAnswer(prompt);
    answerBox.hidden = false;
    if (demoLive) {
      demoLive.textContent = result.text;
    }
    scrollToAnswerOnMobile();
    typeText(answerBody, result.text, 9);
  }

  if (askForm && askInput && answerBox && answerBody) {
    askForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = askInput.value.trim();

      if (!query) {
        askInput.focus();
        return;
      }

      runDemo(query, null, null);
    });

    askInput.addEventListener("input", function () {
      setActiveChip(null);
    });

    demoChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        runDemo(chip.getAttribute("data-prompt"), chip.getAttribute("data-answer"), chip);
      });
    });

    suggestionCards.forEach(function (card) {
      card.addEventListener("click", function () {
        var key = card.getAttribute("data-answer");
        runDemo(card.getAttribute("data-prompt"), key, chipForKey(key));
      });
    });

    if (askReset) {
      askReset.addEventListener("click", function () {
        stopTyping(answerBody);
        answerBody.textContent = "";
        answerBox.hidden = true;
        if (demoLive) {
          demoLive.textContent = "";
        }
        askInput.value = "";
        setActiveChip(null);
        askInput.focus();
      });
    }
  }

  var samples = {
    explain: {
      input: "ما معنى «الجزالة» في وصف الكلام؟",
      style: "شرح لغوي",
      output:
        "الجزالةُ أن يكون اللفظُ صافيَ الدلالة، قويَّ البناء، بعيدًا عن الحشو والتكرار. تقول: كلامٌ جزلٌ، إذا كان متماسكًا لا يستطيع القارئ أن يستبدل بكلماته غيرها دون أن يخسر المعنى. وهي صفةٌ في اللفظ والمعنى معًا، لا في أحدهما وحده."
    },
    rewrite: {
      input: "«قمنا بتطوير النظام لكي يكون أسرع وأسهل في الاستخدام.»",
      style: "إعادة صياغة",
      output:
        "طوّرنا النظام ليكون أسرع، وأسهل في الاستخدام، وأقرب إلى ما يحتاجه المستخدم فعلًا.\n\nحذفنا التكرار، وقدّمنا الفعل، وأبقينا المعنى كما هو."
    },
    analyze: {
      input: "«اللغةُ بيتٌ نسكنه، وكلُّ كلمةٍ نافذة.»",
      style: "قراءة أدبية",
      output:
        "في العبارة استعارةٌ تمزج اللغةَ بالبيت: فكما نأوي إلى البيت، نأوي إلى لغتنا. ثم تتحول الكلمة إلى نافذة، فتفتح المعنى على العالم بدل أن تغلقه.\n\nالتكثيف هنا يمنح الجملة دفئها وفكرتها في آن."
    }
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var showcasePanel = document.getElementById("showcasePanel");
  var panelInput = document.getElementById("panelInput");
  var panelOutput = document.getElementById("panelOutput");
  var panelStyle = document.getElementById("panelStyle");
  var panelLive = document.getElementById("panelLive");
  var copyBtn = document.getElementById("copyBtn");
  var copyLabel = document.getElementById("copyLabel");
  var currentSample = samples.explain;

  function updateCopyLabel(text) {
    if (!copyLabel) {
      return;
    }
    copyLabel.textContent = text;
  }

  function selectTab(tab) {
    var key = tab.getAttribute("data-tab");
    var sample = samples[key];

    if (!sample) {
      return;
    }

    currentSample = sample;
    tabs.forEach(function (item) {
      var isSelected = item === tab;
      item.setAttribute("aria-selected", isSelected ? "true" : "false");
      item.tabIndex = isSelected ? 0 : -1;
    });

    if (showcasePanel) {
      showcasePanel.setAttribute("aria-labelledby", tab.id);
    }
    if (panelInput) {
      panelInput.textContent = sample.input;
    }
    if (panelStyle) {
      panelStyle.textContent = sample.style;
    }
    if (panelLive) {
      panelLive.textContent = sample.output;
    }
    updateCopyLabel("نسخ");

    if (panelOutput) {
      typeText(panelOutput, sample.output, 8);
    }

    if (showcasePanel && !prefersReducedMotion()) {
      showcasePanel.classList.remove("is-updating");
      void showcasePanel.offsetWidth;
      showcasePanel.classList.add("is-updating");
    }
  }

  if (showcasePanel) {
    showcasePanel.addEventListener("animationend", function () {
      showcasePanel.classList.remove("is-updating");
    });
  }

  if (tabs.length) {
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        selectTab(tab);
      });

      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;

        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          tabs[nextIndex].focus();
          selectTab(tabs[nextIndex]);
        }
      });
    });
  }

  function legacyCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    var successful = false;

    try {
      successful = document.execCommand("copy");
    } catch (error) {
      successful = false;
    }

    textarea.remove();
    return successful;
  }

  var copyLabelTimer = null;
  var copyStateTimer = null;

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = currentSample.output;

      var showCopied = function (ok) {
        updateCopyLabel(ok ? "تم النسخ" : "تعذّر النسخ");
        copyBtn.classList.remove("is-copied");
        if (ok) {
          void copyBtn.offsetWidth;
          copyBtn.classList.add("is-copied");
        }
        window.clearTimeout(copyStateTimer);
        copyStateTimer = window.setTimeout(function () {
          copyBtn.classList.remove("is-copied");
        }, 2000);
        window.clearTimeout(copyLabelTimer);
        copyLabelTimer = window.setTimeout(function () {
          updateCopyLabel("نسخ");
        }, 2000);
      };

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(text)
          .then(function () {
            showCopied(true);
          })
          .catch(function () {
            showCopied(legacyCopy(text));
          });
      } else {
        showCopied(legacyCopy(text));
      }
    });
  }

  var countdown = document.getElementById("countdown");
  var launchDateEl = document.getElementById("launchDate");
  var daysEl = document.getElementById("days");
  var hoursEl = document.getElementById("hours");
  var minutesEl = document.getElementById("minutes");
  var secondsEl = document.getElementById("seconds");
  var countdownTimer = null;
  var countdownPrimed = false;
  var tickingNums = [daysEl, hoursEl, minutesEl];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setCountNum(element, value) {
    if (!element) {
      return;
    }

    var next = pad(value);

    if (element.textContent === next) {
      return;
    }

    element.textContent = next;

    if (!countdownPrimed || prefersReducedMotion()) {
      return;
    }

    element.classList.remove("is-ticking");
    void element.offsetWidth;
    element.classList.add("is-ticking");
  }

  tickingNums.forEach(function (element) {
    if (!element) {
      return;
    }
    element.addEventListener("animationend", function () {
      element.classList.remove("is-ticking");
    });
  });

  function updateCountdown() {
    if (!countdown || !launchDateEl) {
      return;
    }

    var remaining = LAUNCH_DATE.getTime() - Date.now();

    if (remaining <= 0) {
      if (countdownTimer) {
        window.clearInterval(countdownTimer);
        countdownTimer = null;
      }
      countdown.hidden = true;
      launchDateEl.textContent = "ابن فارس متاح الآن — أهلًا بك.";
      return;
    }

    var totalSeconds = Math.floor(remaining / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    setCountNum(daysEl, days);
    setCountNum(hoursEl, hours);
    setCountNum(minutesEl, minutes);

    if (secondsEl) {
      secondsEl.textContent = pad(seconds);
    }

    countdownPrimed = true;
  }

  if (launchDateEl) {
    try {
      var dateFormat = new Intl.DateTimeFormat("ar-u-nu-latn", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Riyadh"
      });
      launchDateEl.textContent = "الإطلاق العام · " + dateFormat.format(LAUNCH_DATE);
    } catch (error) {
      launchDateEl.textContent = "الإطلاق العام · 1 ديسمبر 2026، 8:00 مساءً بتوقيت الرياض";
    }
  }

  updateCountdown();
  if (LAUNCH_DATE.getTime() > Date.now()) {
    countdownTimer = window.setInterval(updateCountdown, 1000);
  }

  var waitlistForm = document.getElementById("waitlistForm");
  var emailInput = document.getElementById("email");
  var formMsg = document.getElementById("formMsg");
  var formNote = document.querySelector(".form-note");
  var waitlistSuccess = document.getElementById("waitlistSuccess");
  var successEmail = document.getElementById("successEmail");
  var resetWaitlist = document.getElementById("resetWaitlist");
  var waitlistBtn = waitlistForm ? waitlistForm.querySelector('button[type="submit"]') : null;
  var waitlistBtnLabel = waitlistBtn ? waitlistBtn.textContent : "";
  var isSubmitting = false;

  function clearEmailError() {
    if (waitlistForm) {
      waitlistForm.classList.remove("has-error");
    }
    if (formMsg) {
      formMsg.textContent = "";
    }
  }

  function showEmailError(message) {
    if (waitlistForm) {
      waitlistForm.classList.remove("has-error");
      void waitlistForm.offsetWidth;
      waitlistForm.classList.add("has-error");
    }
    if (formMsg) {
      formMsg.hidden = false;
      formMsg.textContent = message;
    }
  }

  function setSubmitting(state) {
    isSubmitting = state;
    if (waitlistBtn) {
      waitlistBtn.disabled = state;
      waitlistBtn.textContent = state ? "جارٍ التسجيل…" : waitlistBtnLabel;
    }
    if (waitlistForm) {
      waitlistForm.setAttribute("aria-busy", state ? "true" : "false");
    }
  }

  function showEmailSuccess(email) {
    if (successEmail) {
      successEmail.textContent = email;
    }
    waitlistForm.hidden = true;
    if (formMsg) {
      formMsg.hidden = true;
    }
    if (formNote) {
      formNote.hidden = true;
    }
    if (waitlistSuccess) {
      waitlistSuccess.hidden = false;
      waitlistSuccess.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest"
      });
    }
  }

  if (waitlistForm && emailInput) {
    waitlistForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      var email = emailInput.value.trim();
      var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

      if (!isValid) {
        showEmailError("أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.com");
        emailInput.focus();
        return;
      }

      var endpoint = waitlistForm.getAttribute("action") || "";
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
        showEmailError("تعذّر إكمال التسجيل حاليًا. حاول مرة أخرى بعد قليل.");
        return;
      }

      clearEmailError();
      setSubmitting(true);

      var payload = {
        email: email,
        source: "landing-waitlist",
        page: window.location.href,
        submittedAt: new Date().toISOString()
      };

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          return response.json();
        })
        .then(function (result) {
          if (!result || result.ok !== true) {
            throw new Error("rejected");
          }
          showEmailSuccess(email);
        })
        .catch(function () {
          showEmailError("تعذّر إرسال بريدك. تحقق من اتصالك وحاول مرة أخرى.");
        })
        .then(function () {
          setSubmitting(false);
        });
    });

    emailInput.addEventListener("input", clearEmailError);
  }

  if (resetWaitlist && waitlistForm && emailInput) {
    resetWaitlist.addEventListener("click", function () {
      if (waitlistSuccess) {
        waitlistSuccess.hidden = true;
      }
      waitlistForm.hidden = false;
      waitlistForm.classList.remove("has-error");
      if (formMsg) {
        formMsg.hidden = false;
        formMsg.textContent = "";
      }
      if (formNote) {
        formNote.hidden = false;
      }
      emailInput.value = "";
      emailInput.focus();
    });
  }

  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));

  faqItems.forEach(function (item) {
    var button = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      faqItems.forEach(function (otherItem) {
        var otherButton = otherItem.querySelector(".faq-q");
        var otherPanel = otherItem.querySelector(".faq-a");
        otherItem.classList.remove("is-open");
        if (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
        }
        if (otherPanel) {
          otherPanel.setAttribute("aria-hidden", "true");
        }
      });

      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      }
    });
  });
})();
