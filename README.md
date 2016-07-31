# streembitseed

streembitseed is the console version of the Streembit Core software. The streembitseed application runs a seed node for the Streembit network.

streembitseed is a wrapper to use the streembitlib project at https://github.com/streembit/streembitlib (see package.json for dependency information)


Building and running streembitseed
----------------------------------

The streembitseed software is a Node.js application. 

Run Streembit from source 
------------------------

```bash
$ git clone https://github.com/streembit/streembitseed
$ cd streembitseed
```

Install the Node.js dependencies:  

```bash
$ npm install
```

Create a config.json file to provide configuration settings/
```bash
$ nano config.json
```

Copy the following JSON data structure to the file.

```json
{
	"node": {
		"address": "your_ip_address",
		"port": the_port_number_streembit_uses,
		"seeds": [
			{
				"address": "seed.streemio.net",
				"port": 32320,
				"public_key": "033d92278f9440c8b4061dddf862f5e224d0ff312e642edfa2c93c86671442609f"
			},
			{
				"address": "seed.streemio.biz",
				"port": 32320,
				"public_key": "026f2303d7932ed86bf21b7150bcd45024f3926d37b615798855994b6b53e8b81b"
			},
			{
				"address": "seed.streemo.uk",
				"port": 32320,
				"public_key": "035f4881a0c7d50af6fcf7cc40c3eab60c382bf7f8cd83cd2a3ff5064afd893c70"
			},
			{ 
				"address": "seed.streemio.co", 
				"port": 32320, 
				"public_key": "037fb797e8bf14aefba94ea5efafccebfe1b4591567625a68a9f68ef53a02b9306" 
			}
		]
	},
	"log": {
		"level": "debug"
	},
	"wsserver": true,
	"private_network": false,
	"private_network_accounts": [],
	"homedir":  "the_curent_directory",
	"password":  "your_private_key_password"
}
```

Enter the values to the configuration settings fileds. The configuration fields are:

"address": your computer IPv4 IP address. Enter the IP address of the server in which the streembitseed application is executed.

"port": Enter the port number which is configured in the firewall and can listen on incoming Streembit requests. Make sure it is formatted as number, not as string!

"seeds": array of seed nodes. Default is seed.streemio.org, seed.streemio.net, seed.streemio.biz and seed.streemo.uk. Please see above the public keys for these seeds.

"wsserver":  whether start a WebSocket listener or not. WebSocket listener serves Streembit clients which unable to open a TCP port and use the WebSocket fallback. Set it for true if you want to help the network to serv WS request for users who are unable to connect via TCP (due to NAT or firewall issues).

"private_network":  please refer to the private network documention for more information about the Streembit private networks.

"homedir": Enter the current directory. PM2 background process that start from boot requires to define the working directory.

"password": the private key entropy of the seed. The PPKI key pair is generated using this setting.


Run streembitseed:  
```bash
$ node streembit.js -pksecret your_password
```

Alternatively, start streembitseed as a background/service process using the pm2 library.

```bash
$ node pm2start.js 
```

Verify the application has started
```bash
$ pm2 list
```

Check the application logs
```bash
$ pm2 logs
```

(For more information about pm2 please refer to the pm2 library)


Development Process
-------------------

The `master` branch is regularly built and tested, but is not guaranteed to be
completely stable. [Tags](https://github.com/streembit/streembitseed/tags) are created
regularly to indicate new official, stable release versions of Streembit Core.


The codebase is maintained using the “contributor workflow” where everyone without exception contributes patch proposals using “pull requests”. This facilitates social contribution, easy testing and peer review.

To contribute a patch, the workflow is as follows:

  - Fork repository
  - Create topic branch
  - Commit patches

The project coding conventions in [doc/developer-notes.md](doc/developer-notes.md) must be adhered to.

In general [commits should be atomic](https://en.wikipedia.org/wiki/Atomic_commit#Atomic_commit_convention) and diffs should be easy to read. For this reason do not mix any formatting fixes or code moves with actual code changes.

Commit messages should be verbose by default consisting of a short subject line (50 chars max), a blank line and detailed explanatory text as separate paragraph(s); unless the title alone is self-explanatory (like "Corrected typo in main.js") then a single title line is sufficient. Commit messages should be helpful to people reading your code in the future, so explain the reasoning for your decisions. Further explanation [here](http://chris.beams.io/posts/git-commit/).

If a particular commit references another issue, please add the reference, for example "refs #1234", or "fixes #4321". Using "fixes or closes" keywords will cause the corresponding issue to be closed when the pull request is merged.

Please refer to the [Git manual](https://git-scm.com/doc) for more information about Git.

  - Push changes to your fork
  - Create pull request

The title of the pull request should be prefixed by the component or area that the pull request affects. Examples:

    Consensus: Add new UI for ATMEL Xplained board
    Net: Pull contact messages from multiple seeds
    UI: Add record video button
    Trivial: fix typo

If a pull request is specifically not to be considered for merging (yet) please prefix the title with [WIP] or use [Tasks Lists](https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments) in the body of the pull request to indicate tasks are pending.

The body of the pull request should contain enough description about what the patch does together with any justification/reasoning. You should include references to any discussions (for example other tickets or mailing list discussions).

At this stage one should expect comments and review from other contributors. You can add more commits to your pull request by committing them locally and pushing to your fork until you have satisfied all feedback. If your pull request is accepted for merging, you may be asked by a maintainer to squash and or rebase your commits before it will be merged. The length of time required for peer review is unpredictable and will vary from patch to patch.


Pull Request Philosophy
-----------------------

Patchsets should always be focused. For example, a pull request could add a feature, fix a bug, or refactor code; but not a mixture. Please also avoid super pull requests which attempt to do too much, are overly large, or overly complex as this makes review difficult.


###Features

When adding a new feature, thought must be given to the long term technical debt and maintenance that feature may require after inclusion. Before proposing a new feature that will require maintenance, please consider if you are willing to maintain it (including bug fixing). If features get orphaned with no maintainer in the future, they may be removed by the Repository Maintainer.


###Refactoring

Refactoring is a necessary part of any software project's evolution. The following guidelines cover refactoring pull requests for the project.

There are three categories of refactoring, code only moves, code style fixes, code refactoring. In general refactoring pull requests should not mix these three kinds of activity in order to make refactoring pull requests easy to review and uncontroversial. In all cases, refactoring PRs must not change the behaviour of code within the pull request (bugs must be preserved as is).

Project maintainers aim for a quick turnaround on refactoring pull requests, so where possible keep them short, uncomplex and easy to verify. 


Decision Making Process
-------------------------

The following applies to code changes to the Streembit project and related projects such as streembitseed.

Whether a pull request is merged into Streembit rests with the project merge maintainers and ultimately the project lead. 

Maintainers will take into consideration if a patch is in line with the general principles of the project; meets the minimum standards for inclusion; and will judge the general consensus of contributors.

In general, all pull requests must:

  - have a clear use case, fix a demonstrable bug or serve the greater good of the project (for example refactoring for modularisation);
  - be well peer reviewed;
  - have unit tests and functional tests where appropriate;
  - follow code style guidelines;
  - not break the existing test suite;
  - where bugs are fixed, where possible, there should be unit tests demonstrating the bug and also proving the fix. This helps prevent regression.

Patches that change Streembit consensus rules are considerably more involved than normal because they affect the entire ecosystem and so must be preceded by extensive mailing list discussions and have a numbered BIP. While each case will be different, one should be prepared to expend more time and effort than for other kinds of patches because of increased peer review and consensus building requirements.


###Peer Review

Anyone may participate in peer review which is expressed by comments in the pull request. Typically reviewers will review the code for obvious errors, as well as test out the patch set and opine on the technical merits of the patch. Project maintainers take into account the peer review when determining if there is consensus to merge a pull request (remember that discussions may have been spread out over github, mailing list and IRC discussions). The following language is used within pull-request comments:

  - ACK means "I have tested the code and I agree it should be merged";
  - NACK means "I disagree this should be merged", and must be accompanied by sound technical justification. NACKs without accompanying reasoning may be disregarded;
  - utACK means "I have not tested the code, but I have reviewed it and it looks OK, I agree it can be merged";
  - Concept ACK means "I agree in the general principle of this pull request";
  - Nit refers to trivial, often non-blocking issues.

Reviewers should include the commit hash which they reviewed in their comments.

Project maintainers reserve the right to weigh the opinions of peer reviewers using common sense judgement and also may weight based on meritocracy: Those that have demonstrated a deeper commitment and understanding towards the project (over time) or have clear domain expertise may naturally have more weight, as one would expect in all walks of life.

Where a patch set affects consensus critical code, the bar will be set much higher in terms of discussion and peer review requirements, keeping in mind that mistakes could be very costly to the wider community. This includes refactoring of consensus critical code.


Release Policy
--------------

The project leader is the release manager for each Streembit release.


The developer [forum](https://gitter.im/streembit/Streembit)
should be used to discuss complicated or controversial changes before working
on a patch set.


Testing
-------

Testing and code review is the bottleneck for development; we get more pull
requests than we can review and test on short notice. Please be patient and help out by testing
other people's pull requests, and remember this is a security-critical project where any mistake might cost people
lots of money.

### Automated Testing

Developers are strongly encouraged to write [unit tests](/doc/unit-tests.md) for new code, and to
submit new unit tests for old code. Unit tests can be compiled and run
(assuming they weren't disabled in configure) with: `make check`


### Manual Quality Assurance (QA) Testing

Changes should be tested by somebody other than the developer who wrote the
code. This is especially important for large or high-risk changes. It is useful
to add a test plan to the pull request description if testing the changes is
not straightforward.

