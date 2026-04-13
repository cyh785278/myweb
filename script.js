document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Smooth Scrolling
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetBlock = document.querySelector(targetId);
            if (targetBlock) {
                targetBlock.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Intersection Observer for Scroll Animations (AOS Effect)
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Optional: Unobserve after animation is done
                // animateObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => animateObserver.observe(el));

    // 3. Navigation Highlight & Navbar Background on Scroll
    const sections = document.querySelectorAll('section, header');
    const navItems = document.querySelectorAll('.nav-links li a');
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrolled = window.pageYOffset;

        // Navbar bg change
        if (scrolled > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrolled >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current)) {
                item.classList.add('active');
            }
        });
    });

    // 4. Project Card Expansion
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            // Close other cards optionally? Let's allow multiple open for comparison.
            // projectCards.forEach(c => if(c !== card) c.classList.remove('active'));
            card.classList.toggle('active');
            
            // Scroll element into view if it was near bottom
            if(card.classList.contains('active')) {
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 400);
            }
        });
    });

    // 5. Free Board CRUD Logic (LocalStorage)
    const writeBtn = document.getElementById('writeBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const postForm = document.getElementById('postForm');
    const postList = document.getElementById('postList');
    
    let posts = JSON.parse(localStorage.getItem('amk_portfolio_posts')) || [
        { id: 1, title: "반도체 장비 PdM 도입에 대한 의견", author: "Engineer-A", content: "Applied Materials의 Predictive Maintenance 솔루션은 장비 가동률을 획기적으로 높일 수 있는 핵심 기술이라고 생각합니다.", date: "2026.04.13" },
        { id: 2, title: "PID 제어 튜닝 시 오버슈트 방지 팁", author: "Tech-Guru", content: "D항을 미세 조정하면 고속 이송 중 발생하는 진동을 효과적으로 억제할 수 있습니다.", date: "2026.04.12" }
    ];

    function savePosts() {
        localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
        renderPosts();
    }

    function renderPosts() {
        postList.innerHTML = '';
        posts.forEach(post => {
            const item = document.createElement('div');
            item.className = 'board-item';
            item.innerHTML = `
                <div class="board-item-content">
                    <h4>${post.title}</h4>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">${post.content}</p>
                    <div class="board-item-meta">작성자: ${post.author} | 날짜: ${post.date}</div>
                </div>
                <div class="board-actions">
                    <button class="btn-small btn-edit" onclick="editPost(${post.id})">수정</button>
                    <button class="btn-small btn-delete" onclick="deletePost(${post.id})">삭제</button>
                </div>
            `;
            postList.appendChild(item);
        });
    }

    window.editPost = (id) => {
        const post = posts.find(p => p.id === id);
        if (post) {
            document.getElementById('postId').value = post.id;
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postAuthor').value = post.author;
            document.getElementById('postContent').value = post.content;
            postForm.classList.add('active');
            postForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    window.deletePost = (id) => {
        if (confirm("정말로 이 글을 삭제하시겠습니까?")) {
            posts = posts.filter(p => p.id !== id);
            savePosts();
        }
    };

    writeBtn.addEventListener('click', () => {
        postForm.reset();
        document.getElementById('postId').value = '';
        postForm.classList.toggle('active');
    });

    cancelBtn.addEventListener('click', () => {
        postForm.classList.remove('active');
    });

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('postId').value;
        const title = document.getElementById('postTitle').value;
        const author = document.getElementById('postAuthor').value;
        const content = document.getElementById('postContent').value;
        const date = new Date().toLocaleDateString();

        if (id) {
            // Update
            const index = posts.findIndex(p => p.id == id);
            posts[index] = { ...posts[index], title, author, content };
        } else {
            // Create
            posts.unshift({
                id: Date.now(),
                title,
                author,
                content,
                date
            });
        }
        
        savePosts();
        postForm.classList.remove('active');
        postForm.reset();
    });

    renderPosts();
});
