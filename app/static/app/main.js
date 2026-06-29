document.addEventListener("DOMContentLoaded", () => {
    const state = {
        selectedProduct: null,
    };

    if (window.AOS) {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: true,
            offset: 60,
        });
    }

    const heroStars = document.getElementById("stars");
    if (heroStars) {
        for (let index = 0; index < 80; index += 1) {
            const star = document.createElement("div");
            const size = Math.random() * 2 + 0.5;
            star.className = "star";
            star.style.cssText = [
                `width:${size}px`,
                `height:${size}px`,
                `top:${Math.random() * 55}%`,
                `left:${Math.random() * 100}%`,
                `--o:${(Math.random() * 0.6 + 0.2).toFixed(2)}`,
                `--d:${(Math.random() * 3 + 2).toFixed(1)}s`,
                `animation-delay:${(Math.random() * 4).toFixed(1)}s`,
            ].join(";");
            heroStars.appendChild(star);
        }
    }

    const skyline = document.getElementById("skyline");
    if (skyline) {
        const buildingHeights = [20, 45, 30, 60, 35, 50, 25, 70, 40, 55, 30, 65, 45, 35, 50, 28, 42, 38, 55, 32];
        buildingHeights.forEach((height) => {
            const building = document.createElement("div");
            building.className = "building";
            building.style.cssText = `width:${Math.floor(Math.random() * 12 + 8)}px;height:${height}px;`;
            skyline.appendChild(building);
        });
    }

    const categoryButtons = document.querySelectorAll("[data-filter-category]");
    const pages = document.querySelectorAll(".page");
    const navButtons = document.querySelectorAll(".site-nav-link");
    const modal = document.getElementById("buy-modal");
    const requestForm = document.getElementById("request-form-card");
    const buyForm = document.getElementById("buy-form");

    function setMessage(elementId, message, type = "") {
        const messageBox = document.getElementById(elementId);
        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;
        messageBox.className = type ? `form-message ${type}` : "form-message";
    }

    function setStatusMessage(message, type = "") {
        const status = document.getElementById("buy-success-message");
        if (!status) {
            return;
        }

        if (!message) {
            status.textContent = "";
            status.className = "status-message";
            status.style.display = "none";
            return;
        }

        status.textContent = message;
        status.className = type ? `status-message ${type}` : "status-message";
        status.style.display = "block";
    }

    function setActivePage(pageName) {
        pages.forEach((page) => {
            page.classList.toggle("active", page.id === `page-${pageName}`);
        });

        navButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.pageTarget === pageName);
        });

        window.scrollTo({ top: 0, behavior: "smooth" });

        if (pageName === "shop") {
            filterCategory("All");
        }

        if (window.AOS) {
            AOS.refreshHard();
        }
    }

    function scrollToTarget(targetId) {
        const target = document.getElementById(targetId);
        if (!target) {
            return;
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function filterCategory(category) {
        categoryButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.filterCategory === category);
        });

        document.querySelectorAll(".product-card").forEach((card) => {
            const matches = category === "All" || card.dataset.category === category;
            card.style.display = matches ? "flex" : "none";
        });

        setStatusMessage("");

        if (window.AOS) {
            AOS.refresh();
        }
    }

    function openBuyModal(product) {
        state.selectedProduct = product;
        document.getElementById("buy-product-label").textContent = `${product.name} - $${product.price}`;
        buyForm.reset();
        setMessage("buy-form-message", "");
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeBuyModal() {
        state.selectedProduct = null;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        setMessage("buy-form-message", "");
    }

    function buildWhatsAppLink(message) {
        return `https://wa.me/231779005985?text=${encodeURIComponent(message)}`;
    }

    function handleRequestSubmit(event) {
        event.preventDefault();

        if (!requestForm.checkValidity()) {
            requestForm.reportValidity();
            return;
        }

        const formData = new FormData(requestForm);
        const message = [
            "Hi BridgeCart! I would like to place a request.",
            "",
            `Name: ${formData.get("full_name")}`,
            `Phone: ${formData.get("whatsapp_number")}`,
            `Email: ${formData.get("email") || "N/A"}`,
            `Category: ${formData.get("category") || "N/A"}`,
            `Product: ${formData.get("product_description")}`,
            `Budget: ${formData.get("budget") || "N/A"}`,
            `Location: ${formData.get("delivery_location") || "N/A"}`,
        ].join("\n");

        window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
        requestForm.style.display = "none";
        document.getElementById("success-msg").style.display = "block";
    }

    function handleOrderSubmit(event) {
        event.preventDefault();

        if (!buyForm.checkValidity()) {
            buyForm.reportValidity();
            return;
        }

        if (!state.selectedProduct) {
            setMessage("buy-form-message", "Select a product first.", "error");
            return;
        }

        const selectedProduct = state.selectedProduct;
        const formData = new FormData(buyForm);
        const message = [
            "Hi BridgeCart! I want to buy this item.",
            "",
            `Name: ${formData.get("buyer_name")}`,
            `WhatsApp number: ${formData.get("buyer_phone")}`,
            `Product: ${selectedProduct.name}`,
            `Category: ${selectedProduct.category}`,
            `Price: $${selectedProduct.price}`,
            `Notes: ${formData.get("buyer_note") || "N/A"}`,
            "",
            "Please contact me with the next steps.",
        ].join("\n");

        window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
        closeBuyModal();
        setStatusMessage(`Your order request for ${selectedProduct.name} has been submitted. We will contact you on WhatsApp shortly.`, "success");
    }

    document.addEventListener("click", (event) => {
        const pageButton = event.target.closest("[data-page-target]");
        if (pageButton) {
            event.preventDefault();
            const pageName = pageButton.dataset.pageTarget;
            setActivePage(pageName);

            const category = pageButton.dataset.categoryTarget;
            if (category) {
                setActivePage("shop");
                filterCategory(category);
            }

            const scrollTarget = pageButton.dataset.scrollTarget;
            if (scrollTarget) {
                scrollToTarget(scrollTarget);
            }
            return;
        }

        const scrollButton = event.target.closest("[data-scroll-target]");
        if (scrollButton) {
            event.preventDefault();
            scrollToTarget(scrollButton.dataset.scrollTarget);
            return;
        }

        const filterButton = event.target.closest("[data-filter-category]");
        if (filterButton) {
            event.preventDefault();
            filterCategory(filterButton.dataset.filterCategory);
            return;
        }

        const productButton = event.target.closest("[data-open-product]");
        if (productButton) {
            event.preventDefault();
            openBuyModal({
                name: productButton.dataset.productName,
                category: productButton.dataset.productCategory,
                price: productButton.dataset.productPrice,
            });
            return;
        }

        const whatsappButton = event.target.closest("[data-whatsapp-link]");
        if (whatsappButton) {
            event.preventDefault();
            window.open(whatsappButton.dataset.whatsappLink, "_blank", "noopener,noreferrer");
            return;
        }

        const closeButton = event.target.closest("[data-close-buy-modal]");
        if (closeButton) {
            event.preventDefault();
            closeBuyModal();
            return;
        }

        if (event.target === modal) {
            closeBuyModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeBuyModal();
        }
    });

    requestForm.addEventListener("submit", handleRequestSubmit);
    buyForm.addEventListener("submit", handleOrderSubmit);

    setActivePage("home");
    filterCategory("All");
});
