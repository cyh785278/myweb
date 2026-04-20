/**
 * AMK Portfolio - Community Board Script
 * High Precision Version for Guaranteed Interactions
 */

// --- 1. Global State Management ---
// We use window properties to ensure global accessibility across all contexts
window.posts = JSON.parse(localStorage.getItem('amk_portfolio_posts')) || [
    { id: 1, title: "반도체 장비 PdM 도입에 대한 의견", author: "Engineer-A", content: "Applied Materials의 Predictive Maintenance 솔루션은 장비 가동률을 획기적으로 높일 수 있는 핵심 기술이라고 생각합니다.", date: "2026.04.13", likes: 5, dislikes: 0, replies: [] },
    { id: 2, title: "PID 제어 튜닝 시 오버슈트 방지 팁", author: "Tech-Guru", content: "D항을 미세 조정하면 고속 이송 중 발생하는 진동을 효과적으로 억제할 수 있습니다.", date: "2026.04.12", likes: 12, dislikes: 1, replies: [] }
];
window.userReactions = JSON.parse(localStorage.getItem('amk_portfolio_user_reactions')) || {};

// --- 2. Failure-Resistant Handlers ---
// All functions are defined early and assigned to window for HTML onclick compatibility

window.savePosts = () => {
    try {
        localStorage.setItem('amk_portfolio_posts', JSON.stringify(window.posts));
        localStorage.setItem('amk_portfolio_user_reactions', JSON.stringify(window.userReactions));
        if (typeof window.renderPosts === 'function') window.renderPosts();
    } catch (e) {
        console.error("Save failed:", e);
    }
};

window.closeEditModal = () => {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

window.saveEditModal = () => {
    // Diagnostic Alert
    console.log("saveEditModal triggered");
    
    const modal = document.getElementById('editModal');
    const textarea = document.getElementById('modalEditContent');
    if (!modal || !textarea) { alert("오류: 모달 요소를 찾을 수 없습니다."); return; }

    const postId = modal.getAttribute('data-post-id');
    const replyId = modal.getAttribute('data-reply-id');
    
    if (!postId || !replyId) { 
        alert("오류: 데이터 ID가 누락되었습니다. 다시 시도해주세요.");
        window.closeEditModal(); 
        return; 
    }

    const postIndex = window.posts.findIndex(p => String(p.id) === String(postId));
    if (postIndex === -1) { window.closeEditModal(); return; }
    
    const replyIndex = window.posts[postIndex].replies.findIndex(r => String(r.id) === String(replyId));
    if (replyIndex === -1) { window.closeEditModal(); return; }

    const newContent = textarea.value;
    if (newContent && newContent.trim() !== "") {
        window.posts[postIndex].replies[replyIndex].content = newContent;
        window.posts[postIndex].replies[replyIndex].date = new Date().toLocaleString() + " (수정됨)";
        window.savePosts();
        window.closeEditModal();
        alert("수정 완료되었습니다.");
    } else {
        alert("내용을 입력해주세요.");
    }
};

window.editReply = (postId, replyId) => {
    const postIndex = window.posts.findIndex(p => String(p.id) === String(postId));
    if (postIndex === -1) return;
    
    const replyIndex = window.posts[postIndex].replies.findIndex(r => String(r.id) === String(replyId));
    if (replyIndex === -1) return;
    
    const modal = document.getElementById('editModal');
    const textarea = document.getElementById('modalEditContent');
    if (modal && textarea) {
        modal.setAttribute('data-post-id', postId);
        modal.setAttribute('data-reply-id', replyId);
        textarea.value = window.posts[postIndex].replies[replyIndex].content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => textarea.focus(), 150);
    }
};

window.closePostModal = () => {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

window.editPost = (id) => {
    const post = window.posts.find(p => String(p.id) === String(id));
    if (post) {
        const idField = document.getElementById('postId');
        const titleField = document.getElementById('postTitle');
        const authorField = document.getElementById('postAuthor');
        const contentField = document.getElementById('postContent');
        const modalTitle = document.getElementById('postModalTitle');
        const modal = document.getElementById('postModal');

        if (idField) idField.value = post.id;
        if (titleField) titleField.value = post.title;
        if (authorField) authorField.value = post.author;
        if (contentField) contentField.value = post.content;
        if (modalTitle) modalTitle.innerText = "글 수정";
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (titleField) setTimeout(() => titleField.focus(), 150);
        }
    }
};

window.handleReaction = (id, type) => {
    const index = window.posts.findIndex(p => String(p.id) === String(id));
    if (index === -1) return;
    const currentReaction = window.userReactions[id];
    if (currentReaction === type) {
        window.posts[index][type] = Math.max(0, (window.posts[index][type] || 0) - 1);
        delete window.userReactions[id];
    } else if (currentReaction) {
        window.posts[index][currentReaction] = Math.max(0, (window.posts[index][currentReaction] || 0) - 1);
        window.posts[index][type] = (window.posts[index][type] || 0) + 1;
        window.userReactions[id] = type;
    } else {
        window.posts[index][type] = (window.posts[index][type] || 0) + 1;
        window.userReactions[id] = type;
    }
    window.savePosts();
};

window.toggleReplyForm = (id) => {
    const form = document.getElementById(`reply-form-${id}`);
    if (form) form.classList.toggle('active');
};

window.deleteReply = (postId, replyId) => {
    if (confirm("이 답글을 삭제하시겠습니까?")) {
        const postIdx = window.posts.findIndex(p => String(p.id) === String(postId));
        if (postIdx !== -1) {
            window.posts[postIdx].replies = window.posts[postIdx].replies.filter(r => String(r.id) !== String(replyId));
            window.savePosts();
        }
    }
};

window.submitReply = (id) => {
    const authorIn = document.getElementById(`reply-author-${id}`);
    const contentIn = document.getElementById(`reply-content-${id}`);
    if (!authorIn || !contentIn) return;
    const author = authorIn.value;
    const content = contentIn.value;
    if (!author || !content) { alert("작성자와 내용을 모두 입력해주세요."); return; }
    const idx = window.posts.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
        if (!window.posts[idx].replies) window.posts[idx].replies = [];
        window.posts[idx].replies.push({ id: Date.now(), author, content, date: new Date().toLocaleString() });
        window.savePosts();
        authorIn.value = ''; contentIn.value = '';
        const form = document.getElementById(`reply-form-${id}`);
        if (form) form.classList.remove('active');
    }
};

window.deletePost = (id) => {
    if (confirm("정말로 이 글을 삭제하시겠습니까?")) {
        window.posts = window.posts.filter(p => String(p.id) !== String(id));
        window.savePosts();
    }
};

// --- 3. DOM & Rendering ---
window.renderPosts = () => {
    const postList = document.getElementById('postList');
    if (!postList) return;

    postList.innerHTML = '';
    window.posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'board-item-wrapper';
        item.innerHTML = `
            <div class="board-item">
                <div class="board-item-content">
                    <h4>${post.title}</h4>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">${post.content}</p>
                    <div class="board-item-meta">작성자: ${post.author} | 날짜: ${post.date}</div>
                    <div class="reaction-buttons" style="margin-top: 15px; display: flex; gap: 15px;">
                        <button class="reaction-btn ${window.userReactions[post.id] === 'likes' ? 'active' : ''}" onclick="window.handleReaction('${post.id}', 'likes')">
                            👍 <span id="likes-${post.id}">${post.likes || 0}</span>
                        </button>
                        <button class="reaction-btn ${window.userReactions[post.id] === 'dislikes' ? 'active' : ''}" onclick="window.handleReaction('${post.id}', 'dislikes')">
                            👎 <span id="dislikes-${post.id}">${post.dislikes || 0}</span>
                        </button>
                        <button class="btn-small" onclick="window.toggleReplyForm('${post.id}')">답글 달기</button>
                    </div>
                </div>
                <div class="board-actions">
                    <button class="btn-small btn-edit" onclick="window.editPost('${post.id}')">수정</button>
                    <button class="btn-small btn-delete" onclick="window.deletePost('${post.id}')">삭제</button>
                </div>
            </div>
            <div id="reply-section-${post.id}" class="reply-section">
                <div class="replies-list" id="replies-list-${post.id}">
                    ${(post.replies || []).map(reply => `
                        <div class="reply-item">
                            <div class="reply-header">
                                <div class="reply-meta"><strong>${reply.author}</strong> | ${reply.date}</div>
                                <div class="reply-actions">
                                    <button class="btn-tiny" onclick="window.editReply('${post.id}', '${reply.id}')">수정</button>
                                    <button class="btn-tiny btn-delete-tiny" onclick="window.deleteReply('${post.id}', '${reply.id}')">삭제</button>
                                </div>
                            </div>
                            <div class="reply-content">${reply.content}</div>
                        </div>
                    `).join('')}
                </div>
                <div id="reply-form-${post.id}" class="mini-reply-form">
                    <input type="text" id="reply-author-${post.id}" placeholder="작성자" style="margin-bottom: 5px; width: 150px;">
                    <textarea id="reply-content-${post.id}" placeholder="답글 내용을 입력하세요" rows="2"></textarea>
                    <button class="board-btn" style="padding: 5px 15px; margin-top: 5px;" onclick="window.submitReply('${post.id}')">답글 등록</button>
                </div>
            </div>
        `;
        postList.appendChild(item);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Basic Page Logic (Nav, AOS, etc.)
    document.querySelectorAll('.nav-links a').forEach(l => l.onclick = (e) => {
        const tid = l.getAttribute('href');
        if (tid && tid.startsWith('#')) {
            e.preventDefault();
            document.querySelector(tid)?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    const obs = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('aos-animate'); }), { threshold: 0.1 });
    document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));

    const navbar = document.getElementById('navbar');
    window.onscroll = () => {
        const scrolled = window.scrollY;
        const navbar = document.getElementById('navbar');
        const fabHome = document.querySelector('.fab-home');
        
        if (scrolled > 50) navbar?.classList.add('scrolled');
        else navbar?.classList.remove('scrolled');

        if (scrolled > 300) fabHome?.classList.add('active');
        else fabHome?.classList.remove('active');
    };

    // Board Init
    document.getElementById('writeBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('postModal');
        const form = document.getElementById('postForm');
        if (form) { 
            form.reset(); 
            const idField = document.getElementById('postId');
            if (idField) idField.value = '';
            const modalTitle = document.getElementById('postModalTitle');
            if (modalTitle) modalTitle.innerText = "글 쓰기";
        }
        if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });

    document.getElementById('postForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('postId')?.value;
        const title = document.getElementById('postTitle')?.value;
        const author = document.getElementById('postAuthor')?.value;
        const content = document.getElementById('postContent')?.value;

        if (id) {
            const idx = window.posts.findIndex(p => String(p.id) === String(id));
            if (idx !== -1) window.posts[idx] = { ...window.posts[idx], title, author, content };
            alert("수정 완료되었습니다.");
        } else {
            window.posts.unshift({ id: Date.now(), title, author, content, date: new Date().toLocaleDateString(), likes: 0, dislikes: 0, replies: [] });
            alert("등록 완료되었습니다.");
        }
        window.savePosts();
        window.closePostModal();
    });

    // Close on outside click
    const emm = document.getElementById('editModal');
    if (emm) emm.onclick = (e) => { if (e.target === emm) window.closeEditModal(); };
    const pmm = document.getElementById('postModal');
    if (pmm) pmm.onclick = (e) => { if (e.target === pmm) window.closePostModal(); };

    // Contact Form Submission
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName')?.value;
        const email = document.getElementById('contactEmail')?.value;
        const message = document.getElementById('contactMessage')?.value;

        // In a real scenario, you would send this to a server.
        // For now, we show a success message.
        console.log("Contact Form Submission:", { name, email, message });
        alert(`${name}님, 문의가 성공적으로 전송되었습니다.\n검토 후 ${email}로 회신 드리겠습니다.`);
        
        e.target.reset();
    });

    window.renderPosts();
});
