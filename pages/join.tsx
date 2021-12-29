const JoinUs = () => {
  return (
    <main className="py-2 mx-auto w-8/12 sm:px-6 lg:px-8">
      <h1 className="text-2xl">Download the Elite Reporter</h1>
      <p>
        To send game results to our server, you nee to run our "Elite Reporter"
        app in the background while playing Elite. The app will automatically
        report outcomes and upload replays after each match. The following game
        types are included in the skill rating calculations:
      </p>
      <ul className="menu">
        <li>Automatch games</li>
        <li>Custom games</li>
        <li>
          <ul className="menu">
            <li>the rules are Victory Point Control (500 VPs)</li>
            <li>
              no player sends the chat message "unranked" during the first few
              minutes
            </li>
          </ul>
        </li>
      </ul>
      <p>
        Using "Elite Reporter" allows us to build our custom leaderboard from
        these competitive matches, but also to record and present statistics
        from unrated custom games.
        <button className="btn btn-primary">Download</button>
      </p>
      <section>
        <h1 className="text-2xl">Register</h1>
        <p>
          Using "Elite Reporter" is sufficient for appearing on our leaderboard,
          but we can also link your forum identity with your game identity (if
          you have already participated in at least one reported game).
        </p>
        <ul className="steps steps-vertical w-full">
          <li className="step">
            Play in a match reported via "Elite Reporter"
          </li>
          <li className="step">
            <div className="form-control w-full">
              <input
                type="text"
                placeholder="Enter your forum ID here..."
                className="input input-bordered"
              />
            </div>
          </li>
          <li className="step">
            <div className="form-control w-full">
              <input
                type="text"
                placeholder="Enter your Relic ID or 64-bit Steam ID here..."
                className="input input-bordered"
              />
            </div>
          </li>
        </ul>
        <button className="btn btn-primary">Link IDs</button>
      </section>
      <section>
        <h1 className="text-2xl">Connect your Steam ID to your Discord ID</h1>
        <p>
          If you want extended ESL functionality to work on the Discord server,
          you will have to link your Discord ID to your Steam ID:
        </p>
        <ul className="steps steps-vertical w-full">
          <li className="step">
            <div className="form-control w-full">
              <input
                type="text"
                placeholder="Enter your Discord ID here..."
                className="input input-bordered"
              />
            </div>
          </li>
          <li className="step">
            <div className="form-control w-full">
              <input
                type="text"
                placeholder="Enter your Relic ID or 64-bit Steam ID here..."
                className="input input-bordered"
              />
            </div>
          </li>
        </ul>
        <button className="btn btn-primary">Link IDs</button>
      </section>
    </main>
  );
};

export default JoinUs;
