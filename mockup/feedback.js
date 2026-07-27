(() => {
    'use strict';

    const ui = {
        open: document.querySelector('[data-feedback-open]'),
        count: document.querySelector('[data-feedback-count]'),
        panel: document.querySelector('[data-feedback-panel]'),
        backdrop: document.querySelector('[data-feedback-backdrop]'),
        close: document.querySelector('[data-feedback-close]'),
        select: document.querySelector('[data-feedback-select]'),
        scope: document.querySelector('[data-feedback-scope]'),
        status: document.querySelector('[data-feedback-status]'),
        list: document.querySelector('[data-feedback-list]'),
        highlight: document.querySelector('[data-feedback-highlight]'),
        pins: document.querySelector('[data-feedback-pins]'),
        dialog: document.querySelector('[data-feedback-dialog]'),
        form: document.querySelector('[data-feedback-form]'),
        target: document.querySelector('[data-feedback-target]'),
        form_error: document.querySelector('[data-feedback-form-error]'),
        changelog: document.querySelector('[data-feedback-changelog]'),
        changelog_count: document.querySelector('[data-feedback-history-count]'),
    };
    const version = document.querySelector('meta[name="activio-mockup-version"]')?.content || 'unknown';
    const statuses = {
        new: 'Nowa',
        in_progress: 'W realizacji',
        resolved: 'Rozwiązana',
        rejected: 'Odrzucona',
    };
    const state = {
        feedback: [],
        selecting: false,
        selected: null,
        screenshot: null,
        reporter: localStorage.getItem('activio-feedback-author') || '',
        position_frame: null,
        feedback_request: null,
        reload_requested: false,
        load_error: '',
    };

    function escape_html(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function slug(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 54) || 'element';
    }

    function visible_view() {
        return document.querySelector('[data-view]:not([hidden])')?.dataset.view
            || window.location.hash.slice(1)
            || 'marketplace';
    }

    function element_text(element) {
        return (
            element.getAttribute?.('aria-label')
            || element.getAttribute?.('alt')
            || element.dataset?.title
            || element.textContent
            || ''
        ).replace(/\s+/g, ' ').trim().slice(0, 3000);
    }

    function candidate_elements() {
        return document.querySelectorAll([
            '[data-view]',
            '[data-store-header]',
            '[data-partner-header]',
            '[data-store-footer]',
            'h1',
            'h2',
            'h3',
            'article',
            'button',
            'label',
            'tr',
            'img',
            '[data-go]',
            '[data-offer-item]',
        ].join(','));
    }

    function install_feedback_ids() {
        const used = new Set(
            [...document.querySelectorAll('[data-feedback-id]')]
                .map((element) => element.dataset.feedbackId),
        );
        const occurrences = new Map();

        candidate_elements().forEach((element) => {
            if (element.closest('[data-feedback-ui]') || element.dataset.feedbackId) {
                return;
            }

            const view = element.matches('[data-view]')
                ? element.dataset.view
                : element.closest('[data-view]')?.dataset.view || 'shell';
            const semantic = element.dataset.go
                || element.dataset.view
                || element.getAttribute('aria-label')
                || element.getAttribute('alt')
                || element_text(element);
            const base = `${view}:${element.tagName.toLowerCase()}:${slug(semantic)}`;
            const occurrence = (occurrences.get(base) || 0) + 1;
            occurrences.set(base, occurrence);
            let identifier = occurrence === 1 ? base : `${base}:${occurrence}`;
            let suffix = occurrence;

            while (used.has(identifier)) {
                suffix += 1;
                identifier = `${base}:${suffix}`;
            }

            element.dataset.feedbackId = identifier;
            used.add(identifier);
        });
    }

    function ensure_target_id(element) {
        if (element.dataset.feedbackId) {
            return element.dataset.feedbackId;
        }

        const view = element.closest('[data-view]')?.dataset.view || 'shell';
        const base = `${view}:${element.tagName.toLowerCase()}:${slug(element_text(element))}`;
        let identifier = base;
        let suffix = 1;

        while (document.querySelector(`[data-feedback-id="${CSS.escape(identifier)}"]`)) {
            suffix += 1;
            identifier = `${base}:${suffix}`;
        }

        element.dataset.feedbackId = identifier;
        return identifier;
    }

    function css_selector(element) {
        if (element.dataset.feedbackId) {
            return `[data-feedback-id="${CSS.escape(element.dataset.feedbackId)}"]`;
        }

        const parts = [];
        let current = element;

        while (current && current !== document.body) {
            let part = current.tagName.toLowerCase();
            const parent = current.parentElement;

            if (current !== element && current.dataset.feedbackId) {
                parts.unshift(`[data-feedback-id="${CSS.escape(current.dataset.feedbackId)}"]`);
                break;
            }

            if (current.id) {
                parts.unshift(`#${CSS.escape(current.id)}`);
                break;
            }

            if (parent) {
                const siblings = [...parent.children].filter((child) => child.tagName === current.tagName);

                if (siblings.length > 1) {
                    part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
                }
            }

            parts.unshift(part);

            if (current.matches('[data-view]')) {
                parts[0] = `[data-view="${CSS.escape(current.dataset.view)}"]`;
                break;
            }

            current = parent;
        }

        return parts.join(' > ');
    }

    function describe_target(element, selected_text = '') {
        const rect = element.getBoundingClientRect();
        const selector = css_selector(element);

        return {
            element,
            view: visible_view(),
            element_id: ensure_target_id(element),
            selector,
            selected_text: selected_text.slice(0, 2000),
            element_text: element_text(element),
            element_tag: element.tagName.toLowerCase(),
            rect: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                page_x: rect.left + window.scrollX,
                page_y: rect.top + window.scrollY,
            },
        };
    }

    function find_by_text(item) {
        const needle = (item.selected_text || item.element_text || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 180);

        if (needle.length < 4) {
            return null;
        }

        const root = document.querySelector(`[data-view="${CSS.escape(item.view)}"]`) || document;
        return [...root.querySelectorAll('h1,h2,h3,p,button,label,strong,td,article')]
            .find((element) => element_text(element).includes(needle)) || null;
    }

    function resolve_target(item) {
        if (item.view !== visible_view() && item.view !== 'shell') {
            return null;
        }

        if (item.element_id) {
            const exact = document.querySelector(
                `[data-feedback-id="${CSS.escape(item.element_id)}"]`,
            );

            if (exact) {
                return exact;
            }
        }

        if (item.selector) {
            try {
                const selected = document.querySelector(item.selector);

                if (selected) {
                    return selected;
                }
            } catch {
                // Stary selektor może przestać być poprawny po przebudowie widoku.
            }
        }

        return find_by_text(item);
    }

    async function api(path, options = {}) {
        const url = new URL(path, window.location.href);
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        url.username = '';
        url.password = '';

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {}),
                },
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || 'Nie udało się połączyć z systemem uwag.');
            }

            return payload;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Serwer nie odpowiedział. Spróbuj zapisać uwagę ponownie.');
            }

            throw error;
        } finally {
            window.clearTimeout(timeout);
        }
    }

    function open_panel() {
        set_selecting(false);
        ui.panel.classList.add('open');
        ui.panel.setAttribute('aria-hidden', 'false');
        ui.open.classList.add('active');
        ui.backdrop.hidden = false;
    }

    function close_panel() {
        ui.panel.classList.remove('open');
        ui.panel.setAttribute('aria-hidden', 'true');
        ui.open.classList.remove('active');
        ui.backdrop.hidden = true;
    }

    function set_selecting(enabled) {
        state.selecting = enabled;
        document.body.classList.toggle('feedback-selecting', enabled);
        ui.select.classList.toggle('active', enabled);
        ui.select.innerHTML = enabled
            ? '<span>×</span> Anuluj wskazywanie'
            : '<span>＋</span> Wskaż fragment strony';

        if (!enabled) {
            ui.highlight.hidden = true;
        }
    }

    function highlight_element(element) {
        const rect = element.getBoundingClientRect();
        ui.highlight.style.left = `${Math.max(0, rect.left)}px`;
        ui.highlight.style.top = `${Math.max(46, rect.top)}px`;
        ui.highlight.style.width = `${Math.max(1, rect.width)}px`;
        ui.highlight.style.height = `${Math.max(1, rect.height)}px`;
        ui.highlight.hidden = false;
    }

    async function capture_screenshot(target) {
        if (typeof window.html2canvas !== 'function') {
            return '';
        }

        try {
            const target_rect = target.getBoundingClientRect();
            const canvas = await window.html2canvas(document.body, {
                x: window.scrollX,
                y: window.scrollY,
                width: window.innerWidth,
                height: window.innerHeight,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                scale: 1,
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#f5f7fb',
                imageTimeout: 4000,
                ignoreElements: (element) => {
                    if (element.hasAttribute?.('data-feedback-ui')) {
                        return true;
                    }

                    if (element.tagName !== 'IMG') {
                        return false;
                    }

                    const rect = element.getBoundingClientRect();
                    return rect.bottom < 0
                        || rect.top > window.innerHeight
                        || rect.right < 0
                        || rect.left > window.innerWidth;
                },
            });
            const context = canvas.getContext('2d');

            if (context) {
                context.strokeStyle = '#ff6b35';
                context.lineWidth = 5;
                context.fillStyle = 'rgba(255, 107, 53, .12)';
                context.fillRect(target_rect.left, target_rect.top, target_rect.width, target_rect.height);
                context.strokeRect(target_rect.left, target_rect.top, target_rect.width, target_rect.height);
            }

            return canvas.toDataURL('image/jpeg', .72);
        } catch {
            return '';
        }
    }

    function open_composer(element, selected_text) {
        state.selected = describe_target(element, selected_text);
        state.screenshot = capture_screenshot(element);
        ui.target.textContent = selected_text
            ? `Zaznaczony tekst: „${selected_text.slice(0, 180)}”`
            : `Element: ${state.selected.element_text.slice(0, 180) || state.selected.element_tag}`;
        ui.form.elements.author.value = state.reporter;
        ui.form.elements.comment.value = '';
        ui.form_error.hidden = true;
        set_selecting(false);
        ui.dialog.showModal();
        window.setTimeout(() => {
            (state.reporter ? ui.form.elements.comment : ui.form.elements.author).focus();
        }, 0);
    }

    function feedback_filter() {
        return state.feedback.filter((item) => {
            if (ui.scope.value === 'view' && item.view !== visible_view()) {
                return false;
            }

            if (ui.status.value === 'open') {
                return !['resolved', 'rejected'].includes(item.status);
            }

            return ui.status.value === 'all' || item.status === ui.status.value;
        });
    }

    function format_date(value) {
        try {
            return new Intl.DateTimeFormat('pl-PL', {
                dateStyle: 'short',
                timeStyle: 'short',
            }).format(new Date(value));
        } catch {
            return value;
        }
    }

    function status_options(current) {
        return Object.entries(statuses)
            .map(([value, label]) => `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`)
            .join('');
    }

    function render_feedback() {
        const items = feedback_filter();
        const open_count = state.feedback.filter(
            (item) => !['resolved', 'rejected'].includes(item.status),
        ).length;
        ui.count.textContent = String(open_count);
        ui.open.title = `${open_count} otwartych uwag`;

        if (state.load_error) {
            ui.list.innerHTML = `<p class="feedback-empty">${escape_html(state.load_error)}</p>`;
        } else if (items.length === 0) {
            ui.list.innerHTML = '<p class="feedback-empty">Brak uwag dla wybranych filtrów.</p>';
        } else {
            ui.list.innerHTML = items.map((item, index) => {
                const target = resolve_target(item);
                const replies = item.comments.map((comment) => `
                    <div class="feedback-reply${comment.kind === 'action' ? ' action' : ''}">
                        <small>${comment.kind === 'action' ? 'Wykonane działanie' : 'Odpowiedź'}</small>
                        <strong>${escape_html(comment.author)}</strong>
                        <span>${escape_html(comment.comment)}</span>
                    </div>
                `).join('');
                const screenshot = item.screenshot_file
                    ? `<a href="/api/feedback/${encodeURIComponent(item.id)}/screenshot" target="_blank" rel="noopener noreferrer">Screenshot</a>`
                    : '';

                return `
                    <article class="feedback-card" data-feedback-item="${escape_html(item.id)}">
                        <div class="feedback-card-head">
                            <span class="feedback-card-index">${index + 1}</span>
                            <select class="feedback-card-status" data-feedback-change-status aria-label="Status uwagi">
                                ${status_options(item.status)}
                            </select>
                        </div>
                        <p class="feedback-card-target">${target ? 'Przypięta do elementu' : 'Element zmieniony lub poza ekranem'} · ${escape_html(item.view)}</p>
                        <p class="feedback-card-comment">${escape_html(item.comment)}</p>
                        <div class="feedback-card-meta">${escape_html(item.author)} · ${escape_html(format_date(item.created_at))} · wersja ${escape_html(item.mockup_version || '—')}</div>
                        ${replies ? `<div class="feedback-replies">${replies}</div>` : ''}
                        <div class="feedback-card-actions">
                            <button type="button" data-feedback-show-element>Pokaż element</button>
                            <button type="button" data-feedback-reply>Odpowiedz</button>
                            ${screenshot}
                        </div>
                        <form class="feedback-reply-form" data-feedback-reply-form>
                            <input name="comment" maxlength="4000" placeholder="Napisz odpowiedź…" required>
                            <label><input type="checkbox" name="is_action"> To jest opis wykonanego działania</label>
                            <button type="submit">Wyślij</button>
                        </form>
                    </article>
                `;
            }).join('');
        }

        render_pins(state.load_error ? [] : items);
    }

    function render_changelog() {
        if (!ui.changelog) {
            return;
        }

        const items = state.feedback
            .filter((item) => item.status !== 'rejected')
            .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

        if (ui.changelog_count) {
            ui.changelog_count.textContent = String(items.length);
        }

        if (items.length === 0) {
            ui.changelog.innerHTML = '<p class="feedback-history-empty">Brak merytorycznych uwag.</p>';
            return;
        }

        ui.changelog.innerHTML = items.map((item, index) => {
            const actions = (item.comments || [])
                .filter((comment) => comment.kind === 'action')
                .map((comment) => `
                <li>
                    <span>✓</span>
                    <div>
                        <strong>${escape_html(comment.author)}</strong>
                        <p>${escape_html(comment.comment)}</p>
                        <small>${escape_html(format_date(comment.created_at))}</small>
                    </div>
                </li>
            `).join('');
            const replies = (item.comments || [])
                .filter((comment) => comment.kind !== 'action')
                .map((comment) => `
                    <li>
                        <div>
                            <strong>${escape_html(comment.author)}</strong>
                            <p>${escape_html(comment.comment)}</p>
                            <small>${escape_html(format_date(comment.created_at))}</small>
                        </div>
                    </li>
                `).join('');
            const screenshot = item.screenshot_file
                ? `<a href="/api/feedback/${encodeURIComponent(item.id)}/screenshot" target="_blank" rel="noopener noreferrer">Zobacz pierwotny ekran ↗</a>`
                : '';

            return `
                <article class="feedback-change-card" data-feedback-history-item="${escape_html(item.id)}">
                    <div class="feedback-change-index" title="${escape_html(item.id)}">#${escape_html(item.id.slice(-4).toUpperCase())}</div>
                    <div class="feedback-change-body">
                        <div class="feedback-change-head">
                            <span class="feedback-change-status status-${escape_html(item.status)}">${escape_html(statuses[item.status] || item.status)}</span>
                            <small>${escape_html(item.view)} · ${escape_html(format_date(item.created_at))}</small>
                        </div>
                        <blockquote>${escape_html(item.comment)}</blockquote>
                        <p class="feedback-change-author">Uwagi dodał: <strong>${escape_html(item.author)}</strong></p>
                        <div class="feedback-change-actions">
                            <h3>Podjęte działania</h3>
                            ${actions
                                ? `<ol>${actions}</ol>`
                                : '<p class="feedback-history-empty">Działania nie zostały jeszcze opisane.</p>'}
                        </div>
                        ${replies ? `
                            <div class="feedback-change-discussion">
                                <h3>Pozostałe odpowiedzi</h3>
                                <ol>${replies}</ol>
                            </div>
                        ` : ''}
                        <div class="feedback-change-links">
                            <button type="button" data-feedback-history-target>Przejdź do zmienionego miejsca</button>
                            ${screenshot}
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    function render_pins(items = feedback_filter()) {
        ui.pins.replaceChildren();

        items.forEach((item, index) => {
            const target = resolve_target(item);

            if (!target) {
                return;
            }

            const pin = document.createElement('button');
            pin.type = 'button';
            pin.className = 'feedback-pin';
            pin.dataset.feedbackPin = item.id;
            pin.setAttribute('aria-label', `Otwórz uwagę ${index + 1}`);
            pin.innerHTML = `<span>${index + 1}</span>`;
            ui.pins.append(pin);
        });

        schedule_pin_positions();
    }

    function position_pins() {
        state.position_frame = null;

        ui.pins.querySelectorAll('[data-feedback-pin]').forEach((pin) => {
            const item = state.feedback.find((feedback) => feedback.id === pin.dataset.feedbackPin);
            const target = item ? resolve_target(item) : null;

            if (!target || target.hidden) {
                pin.hidden = true;
                return;
            }

            const rect = target.getBoundingClientRect();
            pin.hidden = rect.bottom < 46 || rect.top > window.innerHeight;
            pin.style.left = `${Math.min(window.innerWidth - 16, Math.max(16, rect.right))}px`;
            pin.style.top = `${Math.max(72, rect.top + 8)}px`;
        });
    }

    function schedule_pin_positions() {
        if (state.position_frame === null) {
            state.position_frame = window.requestAnimationFrame(position_pins);
        }
    }

    async function load_feedback() {
        state.reload_requested = true;

        if (state.feedback_request) {
            return state.feedback_request;
        }

        state.feedback_request = (async () => {
            while (state.reload_requested) {
                state.reload_requested = false;

                try {
                    const payload = await api('/api/feedback?status=all');
                    state.load_error = '';
                    state.feedback = payload.feedback;
                    render_feedback();
                    render_changelog();
                } catch (error) {
                    state.load_error = error.message;
                    render_feedback();
                    if (ui.changelog) {
                        ui.changelog.innerHTML = `
                            <p class="feedback-history-empty">
                                Nie udało się wczytać historii: ${escape_html(error.message)}
                                <button type="button" data-feedback-history-retry>Spróbuj ponownie</button>
                            </p>
                        `;
                    }
                    if (ui.changelog_count) {
                        ui.changelog_count.textContent = '—';
                    }
                }
            }
        })();

        try {
            await state.feedback_request;
        } finally {
            state.feedback_request = null;
        }
    }

    function navigate_to_feedback(item) {
        if (item.view !== visible_view() && typeof window.render_view === 'function') {
            window.render_view(item.view);
        } else if (item.view !== visible_view()) {
            window.location.hash = item.view;
        }

        let attempts = 0;
        const find_and_show = () => {
            attempts += 1;
            install_feedback_ids();
            const target = resolve_target(item);

            if (!target) {
                if (attempts < 12) {
                    window.setTimeout(find_and_show, 150);
                } else {
                    open_panel();
                }
                return;
            }

            close_panel();
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.remove('feedback-flash');
            window.requestAnimationFrame(() => target.classList.add('feedback-flash'));
        };
        window.setTimeout(find_and_show, 100);
    }

    ui.open.addEventListener('click', () => {
        if (ui.panel.classList.contains('open')) {
            close_panel();
        } else {
            open_panel();
        }
    });
    ui.close.addEventListener('click', close_panel);
    ui.backdrop.addEventListener('click', close_panel);
    ui.select.addEventListener('click', () => {
        const enable = !state.selecting;
        close_panel();
        set_selecting(enable);
    });
    ui.scope.addEventListener('change', render_feedback);
    ui.status.addEventListener('change', render_feedback);
    document.querySelectorAll('[data-feedback-cancel]').forEach((button) => {
        button.addEventListener('click', () => ui.dialog.close());
    });

    document.addEventListener('pointermove', (event) => {
        if (!state.selecting || event.target.closest?.('[data-feedback-ui]')) {
            return;
        }

        highlight_element(event.target);
    }, true);

    document.addEventListener('click', (event) => {
        if (!state.selecting || event.target.closest?.('[data-feedback-ui]')) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        const selection = window.getSelection();
        const selected_text = selection?.toString().replace(/\s+/g, ' ').trim() || '';
        let target = event.target;

        if (selected_text && selection.rangeCount > 0) {
            const container = selection.getRangeAt(0).commonAncestorContainer;
            target = container.nodeType === Node.ELEMENT_NODE
                ? container
                : container.parentElement;
        }

        if (!(target instanceof HTMLElement) || target.closest('[data-feedback-ui]')) {
            return;
        }

        open_composer(target, selected_text);
    }, true);

    ui.form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!state.selected) {
            return;
        }

        const submit = ui.form.querySelector('[type="submit"]');
        const author = ui.form.elements.author.value.trim();
        const comment = ui.form.elements.comment.value.trim();
        submit.disabled = true;
        submit.textContent = 'Zapisywanie…';
        ui.form_error.hidden = true;

        try {
            state.reporter = author;
            localStorage.setItem('activio-feedback-author', author);
            const screenshot = ui.form.elements.include_screenshot.checked
                ? await Promise.race([
                    state.screenshot,
                    new Promise((resolve) => window.setTimeout(() => resolve(''), 6000)),
                ])
                : '';
            await api('/api/feedback', {
                method: 'POST',
                body: JSON.stringify({
                    author,
                    comment,
                    view: state.selected.view,
                    page_url: window.location.href,
                    element_id: state.selected.element_id,
                    selector: state.selected.selector,
                    selected_text: state.selected.selected_text,
                    element_text: state.selected.element_text,
                    element_tag: state.selected.element_tag,
                    rect: state.selected.rect,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        pixel_ratio: window.devicePixelRatio,
                    },
                    mockup_version: version,
                    screenshot,
                }),
            });
            ui.dialog.close();
            await load_feedback();
            open_panel();
        } catch (error) {
            ui.form_error.textContent = error.message;
            ui.form_error.hidden = false;
        } finally {
            submit.disabled = false;
            submit.textContent = 'Dodaj uwagę';
        }
    });

    ui.list.addEventListener('click', (event) => {
        const card = event.target.closest('[data-feedback-item]');

        if (!card) {
            return;
        }

        const item = state.feedback.find((feedback) => feedback.id === card.dataset.feedbackItem);

        if (!item) {
            return;
        }

        if (event.target.closest('[data-feedback-show-element]')) {
            navigate_to_feedback(item);
        }

        if (event.target.closest('[data-feedback-reply]')) {
            const form = card.querySelector('[data-feedback-reply-form]');
            form.classList.toggle('open');
            form.querySelector('input')?.focus();
        }
    });

    ui.list.addEventListener('change', async (event) => {
        if (!event.target.matches('[data-feedback-change-status]')) {
            return;
        }

        const card = event.target.closest('[data-feedback-item]');

        try {
            await api(`/api/feedback/${encodeURIComponent(card.dataset.feedbackItem)}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: event.target.value,
                    author: state.reporter || 'Recenzent',
                }),
            });
            await load_feedback();
        } catch (error) {
            window.alert(error.message);
            await load_feedback();
        }
    });

    ui.list.addEventListener('submit', async (event) => {
        if (!event.target.matches('[data-feedback-reply-form]')) {
            return;
        }

        event.preventDefault();
        const card = event.target.closest('[data-feedback-item]');
        const input = event.target.elements.comment;
        const button = event.target.querySelector('button');
        button.disabled = true;

        try {
            await api(`/api/feedback/${encodeURIComponent(card.dataset.feedbackItem)}/comments`, {
                method: 'POST',
                body: JSON.stringify({
                    author: state.reporter || 'Recenzent',
                    comment: input.value.trim(),
                    kind: event.target.elements.is_action.checked ? 'action' : 'reply',
                }),
            });
            await load_feedback();
        } catch (error) {
            window.alert(error.message);
            button.disabled = false;
        }
    });

    ui.pins.addEventListener('click', (event) => {
        const pin = event.target.closest('[data-feedback-pin]');

        if (!pin) {
            return;
        }

        open_panel();
        window.setTimeout(() => {
            ui.list.querySelector(`[data-feedback-item="${CSS.escape(pin.dataset.feedbackPin)}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 250);
    });

    ui.changelog?.addEventListener('click', (event) => {
        if (event.target.closest('[data-feedback-history-retry]')) {
            event.target.disabled = true;
            load_feedback();
            return;
        }

        const card = event.target.closest('[data-feedback-history-item]');

        if (!card || !event.target.closest('[data-feedback-history-target]')) {
            return;
        }

        const item = state.feedback.find((feedback) => feedback.id === card.dataset.feedbackHistoryItem);
        if (item) {
            navigate_to_feedback(item);
        }
    });

    window.addEventListener('scroll', schedule_pin_positions, { passive: true });
    window.addEventListener('resize', schedule_pin_positions);
    window.addEventListener('activio:viewchange', () => {
        window.setTimeout(() => {
            install_feedback_ids();
            render_feedback();
        }, 0);
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && state.selecting) {
            set_selecting(false);
        }
    });

    const observer = new MutationObserver(() => {
        install_feedback_ids();
        render_feedback();
    });
    observer.observe(document.querySelector('main'), { childList: true, subtree: true });

    install_feedback_ids();
    load_feedback();
})();
