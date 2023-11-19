# Contributing to Image Downloader

## Before Submitting an Issue

Check that [our issue database](https://gitlab.com/demsking/image-downloader/issues)
doesn't already include that problem or suggestion before submitting an issue.
If you find a match, you can use the "subscribe" button to get notified on
updates. Do *not* leave random "+1" or "I have this too" comments, as they
only clutter the discussion, and don't help resolving it. However, if you
have ways to reproduce the issue or have additional information that may help
resolving the issue, please leave a comment.

## Writing Good Bug Reports and Feature Requests

Please file a single issue per problem and feature request. Do not file combo 
issues. Please do not submit multiple comments on a single issue - write your 
issue with all the environmental information and reproduction steps so that an 
engineer can reproduce it.

The community wants to help you find a solution to your problem, but every 
problem is unique. In order for an engineer to help resolve your issue, they 
need to be able to reproduce it. We put the product through extensive manual 
and automated QA for every release, and verify all of its functionality. Any 
feature that was previously working in a release that is no longer working is 
marked as a severity/blocker for immediate review.

This means that if you are encountering an error, it is likely due to a unique 
configuration of your system. Reproducing your specific error may require 
significant information about your system and environment. Help us in advance 
by providing a complete assessment of your system and the steps necessary to 
reproduce the issue.

Therefore:

* The details of your environment including OS version, NodeJS version.
* Provide reproducible steps, what the result of the steps was, and what you 
would have expected.
* A detailed description of the behavior that you expect.

## Contribute

Contributions to Image Downloader are welcome. Here is how you can contribute:

1. [Submit bugs or a feature request](https://gitlab.com/image-downloader/issues) and
   help us verify fixes as they are checked in
2. Create your working branch from the `dev` branch:
   `git checkout dev -b feature/my-awesome-feature`
3. Write code for a bug fix or for your new awesome feature
4. Write test cases for your changes
5. [Submit merge requests](https://gitlab.com/image-downloader/merge_requests)
   for bug fixes and features and discuss existing proposals
