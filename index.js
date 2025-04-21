document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
        window.location.href = "auth.html";
        return;
    }

    // Update user account information
    const userNameElement = document.querySelector(".user-name");
    const storeNameElement = document.querySelector(".store-name");
    const logoutButton = document.getElementById("logoutBtn");

    userNameElement.textContent = currentUser.name;
    storeNameElement.textContent = currentUser.storeName;

    // Handle logout
    logoutButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("currentUser");
            window.location.href = "auth.html";
        }
    });

    const inventoryForm = document.getElementById("inventoryForm");
    const inventoryTable = document.getElementById("inventoryTable");
    const saveInventoryButton = document.getElementById("saveInventory");
    const viewInventoryButton = document.getElementById("viewInventory");
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading";
    document.body.appendChild(loadingIndicator);

    // Update store name in header
    document.querySelector("h1").textContent = `${currentUser.storeName} - Medicine Inventory`;

    let inventory = currentUser.inventory || [];

    // Function to generate a unique ID for each inventory item
    function generateId() {
        return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Function to show loading indicator
    function showLoading() {
        loadingIndicator.style.display = "block";
    }

    // Function to hide loading indicator
    function hideLoading() {
        loadingIndicator.style.display = "none";
    }

    // Function to format date
    function formatDate(dateString) {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Function to format price in Indian Rupees
    function formatPrice(price) {
        if (isNaN(price)) return "₹0.00";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }

    // Function to check if an item is expired
    function isExpired(expiryDate) {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    }

    // Function to check if an item is expiring soon (within 30 days)
    function isExpiringSoon(expiryDate) {
        if (!expiryDate) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return new Date(expiryDate) <= thirtyDaysFromNow && !isExpired(expiryDate);
    }

    // Function to update the inventory table
    function updateTable() {
        if (!inventoryTable) return;
        
        inventoryTable.innerHTML = "";
        inventory.forEach((item, index) => {
            const row = document.createElement("tr");
            const expiryClass = isExpired(item.expiryDate) ? "expired" : 
                              isExpiringSoon(item.expiryDate) ? "expiring-soon" : "";

            row.innerHTML = `
                <td>${item.medicineName || "N/A"}</td>
                <td>${item.quantity || 0}</td>
                <td>${item.batchNumber || "N/A"}</td>
                <td>${formatDate(item.manufacturerDate)}</td>
                <td class="${expiryClass}">${formatDate(item.expiryDate)}</td>
                <td>${formatPrice(item.pricePerUnit)}</td>
                <td class="actions">
                    <button onclick="editItem(${index})">Edit</button>
                    <button onclick="deleteItem(${index})">Delete</button>
                </td>
            `;

            inventoryTable.appendChild(row);
        });
        updateInventoryStats();
        saveUserInventory();
    }

    // Function to update inventory statistics
    function updateInventoryStats() {
        const totalItems = inventory.length;
        const expiredItems = inventory.filter(item => isExpired(item.expiryDate)).length;
        const expiringSoonItems = inventory.filter(item => isExpiringSoon(item.expiryDate)).length;
        const totalValue = inventory.reduce((sum, item) => {
            const price = parseFloat(item.pricePerUnit) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);

        const statsDiv = document.getElementById("inventoryStats") || document.createElement("div");
        statsDiv.id = "inventoryStats";
        statsDiv.innerHTML = `
            <div class="stats-container">
                <div class="stat-item">
                    <h3>Total Items</h3>
                    <p>${totalItems}</p>
                </div>
                <div class="stat-item">
                    <h3>Expired Items</h3>
                    <p>${expiredItems}</p>
                </div>
                <div class="stat-item">
                    <h3>Expiring Soon</h3>
                    <p>${expiringSoonItems}</p>
                </div>
                <div class="stat-item">
                    <h3>Total Value</h3>
                    <p>${formatPrice(totalValue)}</p>
                </div>
            </div>
        `;

        if (!document.getElementById("inventoryStats")) {
            document.querySelector(".container").insertBefore(statsDiv, inventoryTable);
        }
    }

    // Function to save user's inventory
    function saveUserInventory() {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = users.map(user => {
            if (user.id === currentUser.id) {
                return { ...user, inventory };
            }
            return user;
        });
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        
        // Update current user
        currentUser.inventory = inventory;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    // Function to edit an inventory item
    window.editItem = (index) => {
        const item = inventory[index];
        if (!item) return;

        const form = document.getElementById("inventoryForm");
        if (!form) return;
        
        form.querySelector("#medicineName").value = item.medicineName || "";
        form.querySelector("#quantity").value = item.quantity || "";
        form.querySelector("#batchNumber").value = item.batchNumber || "";
        form.querySelector("#manufacturerDate").value = item.manufacturerDate || "";
        form.querySelector("#expiryDate").value = item.expiryDate || "";
        form.querySelector("#pricePerUnit").value = item.pricePerUnit || "";

        // Remove the item from inventory
        inventory.splice(index, 1);
        updateTable();
    };

    // Function to delete an inventory item
    window.deleteItem = (index) => {
        if (confirm("Are you sure you want to delete this item?")) {
            inventory.splice(index, 1);
            updateTable();
        }
    };

    // Event listener to handle form submission
    inventoryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        showLoading();

        const medicineName = document.getElementById("medicineName").value.trim();
        const quantity = parseFloat(document.getElementById("quantity").value);
        const batchNumber = document.getElementById("batchNumber").value.trim();
        const manufacturerDate = document.getElementById("manufacturerDate").value;
        const expiryDate = document.getElementById("expiryDate").value;
        const pricePerUnit = parseFloat(document.getElementById("pricePerUnit").value);

        // Validate inputs
        if (!medicineName || isNaN(quantity) || !batchNumber || !manufacturerDate || !expiryDate || isNaN(pricePerUnit)) {
            alert("Please fill in all fields with valid values.");
            hideLoading();
            return;
        }

        const newItem = {
            id: generateId(),
            medicineName,
            quantity,
            batchNumber,
            manufacturerDate,
            expiryDate,
            pricePerUnit,
        };

        inventory.push(newItem);
        updateTable();
        inventoryForm.reset();
        hideLoading();
    });

    // Event listener to save inventory
    saveInventoryButton.addEventListener("click", () => {
        showLoading();
        saveUserInventory();
        setTimeout(() => {
            hideLoading();
            showToast("Inventory saved successfully!");
        }, 500);
    });

    // Event listener to view inventory
    viewInventoryButton.addEventListener("click", () => {
        showLoading();
        inventory = currentUser.inventory || [];
        updateTable();
        hideLoading();
        showToast("Inventory loaded successfully!");
    });

    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            saveUserInventory();
            showToast("Inventory saved successfully!");
        }
    });

    // Function to show toast notification
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Initialize the table
    updateTable();
});