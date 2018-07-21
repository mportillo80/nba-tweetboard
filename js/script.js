(function($) {
  'use strict';

  const poller = new tweetboard.Poller; // instantiate

  let leaderboard = [];
  let duration = 0;
  let interval;

  /**
   * call poller every 15 seconds (except for first instance)
   */

  function startPoller() {
    interval = setInterval(() => {
      $.when(
        getData('players', 10),
        getData('teams', 10)
      )
      .then((res1, res2) => addToLeaderboard(res1, res2));

      // increase the duration after first execution to standard 15 secs
      if (duration === 0) {
        clearInterval(interval);
        duration = 15000;
        startPoller();
      }
    }, duration);
  }

  /**
   * get data from API based on type
   */

  function getData(type, limit) {
    return poller
      .poll({
        type,
        limit
      });
  }
  
  /**
   * add to existing leaderboard
   * sort counts and limit to top 5, map to DOM
   */

  function addToLeaderboard(dataType1, dataType2) {
    const leaderboardElem = document.querySelector('.leaderboard > ul');
    const latestData = [...dataType1, ...dataType2];

    // update existing entries in leaderboard OR
    // add new entries to leaderboard
    latestData.forEach(newItem => {
      const leaderboardMatch = leaderboard.find(item => item.name === newItem.name);
      if (leaderboardMatch) {
        leaderboardMatch.count = newItem.count;
      } else {
        leaderboard.push(newItem);
      }
    });

    // sort and return top 5
    leaderboard = leaderboard
      .sort((a, b) => {
        if (a.count > b.count) { return -1; }
        if (a.count < b.count) { return 1;  }

        return 0;
      })
      .slice(0, 5);

    // map to DOM
    leaderboardElem.innerHTML = ''; // "clear"
    leaderboard.forEach(item => {
      const itemElem = document.createElement('li');
      const nameElem = document.createElement('div');
      const mentionsElem = document.createElement('div');

      nameElem.innerHTML = item.name;
      mentionsElem.innerHTML = `<span>${formatNumber(item.count)}</span> <span>mentions</span>`;

      // set class names for styling
      nameElem.className = 'name';

      itemElem.appendChild(nameElem);
      itemElem.appendChild(mentionsElem);
      leaderboardElem.appendChild(itemElem);

      // perform "shake" animation
      toggleLeaderboardAnimation();
    });
  }

  /**
   * loop through digits in number starting from end
   * and add a comma every 3rd digit
   */

  function formatNumber(num) {
    const numToString = num.toString().split('').reverse();
    const formattedNumber = [];
    let posCheck = 0;

    for (let i = numToString.length - 1; i >= 0; i--) {
      formattedNumber.push(numToString[i]);
      posCheck++;
      if (posCheck === 3 && i !== 0) {
        formattedNumber.push(',');
        posCheck = 0;
      }
    }

    return formattedNumber.join('');
  }

  /**
   * animate the leaderboard as content is "refreshed"
   */

  function toggleLeaderboardAnimation() {
    const leaderboard = document.querySelector('.leaderboard');
    const shakeClass = 'shake-up';
    leaderboard.classList.add(shakeClass);
    setTimeout(() => {
      leaderboard.classList.remove(shakeClass);
    }, 500);
  }

  // kick off poller
  startPoller();

})(jQuery);
