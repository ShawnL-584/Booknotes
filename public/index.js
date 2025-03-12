document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const dropdownList = document.getElementById("dropdownList");

  // Debounce function used to prevent a lot of fetch request per input.
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Function to handle the debounced input event

  const handleDebouncedInput = async function () {
    const searchTerm = searchInput.value.trim();
    console.log(`SearchTerm : ${searchTerm}`);

    try {
      const { title, author, cover_id } = await fetchData(searchTerm);
      console.log("Searched Book: ", title);
      console.log("Cover Id: ", cover_id);
      console.log("Book Author: ", author);

      // update dropdown list
      await updateDropdown(title, cover_id, author, dropdownList);
    } catch (error) {
      console.log(`Error updating dropdown : ${error}`);
    }
  };
  // Attach the debounced input event handler
  searchInput.addEventListener("input", debounce(handleDebouncedInput, 300));

  document.addEventListener("click", function (event) {
    // Close dropdown when clicking outside the search container
    if (!event.target.closest(".dropdown")) {
      dropdownList.style.display = "none";
    }
  });

  const label = $("label");
  const labelArray = document.querySelectorAll("label");
  //Add checked (orange color) class clicked labels.
  label.on("click", function (event) {
    label.removeClass("checked");
    const labelValue = $(this).attr("for");
    for (let i = 0; i < labelValue; i++) {
      $(labelArray[i]).addClass("checked");
    }
  });
});

async function fetchData(searchTerm) {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${searchTerm}&limit=10`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    const result = data.docs;

    const title = result.map((book) => book.title);
    const author = result.map((book) => (book.author_name ? book.author_name[0] : "Unknown"));
    const cover_id = result.map((book) => book.cover_i);
    return {
      title,
      author,
      cover_id,
    };
  } catch (error) {
    console.log(`Error fetching data: `, error);
  }
}

async function updateDropdown(items, cover_id, author, dropdownList) {
  // create list item based on the fetch results.
  const html = items
    .map(
      (item, index) =>
        `<a href="/book?title=${item}&author=${author[index]}&cover_id=${cover_id[index] ? cover_id[index] : 0}">
          <li class="listItem">
            <img src="https://covers.openlibrary.org/b/id/${
              cover_id[index]
            }-S.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png" width="40" height="60" alt="book blank picture">
            <div>
              <p><strong>${item}</strong></p>
              <p>By ${author[index]}</p>
            </div>
          </li>
        </a>`
    )
    .join("");
  dropdownList.innerHTML = html;

  // show and hide dropdown
  if (items.length > 1) {
    dropdownList.style.display = "block";
  } else {
    dropdownList.style.display = "none";
  }
}

// Send error message when user submits form without the ratings
function validateForm() {
  // check if the radio button is selected
  const ratingInput = document.getElementsByName("rating");
  const selectedRating = Array.from(ratingInput).find((input) => input.checked);

  if (!selectedRating) {
    document.getElementById("error-message").innerText = "Please select a rating.";
  }
}
