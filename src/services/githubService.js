
export default class GitHubService {
    constructor(token = null) {
      this.baseUrl = 'https://api.github.com';
      this.headers = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (token) {
        this.headers['Authorization'] = `token ${token}`;
      }
    }
  
    /**
     * parse gitHub URL 
     * @param {string} url 
     * @returns {Object} 
     */
    parseGitHubUrl(url) {
      if (!url) return null;
      
      try {
       
        const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
        const match = url.match(regex);
        
        if (match && match.length >= 3) {
          return {
            owner: match[1],
            repo: match[2].replace('.git', '')
          };
        }
        return null;
      } catch (error) {
        console.error('Error parsing GitHub URL:', error);
        return null;
      }
    }
  
    /**
     * repo details
     * @param {string} owner 
     * @param {string} repo 
     * @returns {Promise}
     */
    async getRepositoryDetails(owner, repo) {
      try {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
          headers: this.headers
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching repository details:', error);
        throw error;
      }
    }
  
    /**
     * readme content
     * @param {string} owner 
     * @param {string} repo 
     * @returns {Promise} 
     */
    async getReadmeContent(owner, repo) {
      try {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/readme`, {
          headers: this.headers
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            return null; 
          }
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
       
        if (data.content && data.encoding === 'base64') {
          return atob(data.content);
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching README:', error);
        return null;
      }
    }
  
    /**
     * fetch repo (contributions)
     * @param {string} owner 
     * @param {string} repo 
     * @returns {Promise} 
     */
    async getContributingContent(owner, repo) {
      try {
       
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/CONTRIBUTING.md`, {
          headers: this.headers
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
       
        if (data.content && data.encoding === 'base64') {
          return atob(data.content);
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching CONTRIBUTING.md:', error);
        return null;
      }
    }
  
    /**
     * fetch beginner-friendly issues
     * @param {string} owner 
     * @param {string} repo 
     * @returns {Promise} 
     */
    async getBeginnerFriendlyIssues(owner, repo) {
      try {
        // find common beginner issue labels
        const labels = [
          'good-first-issue',
          'good first issue',
          'beginner-friendly',
          'beginner friendly',
          'easy',
          'starter'
        ];
        
      
        const labelQuery = labels.map(label => `label:"${label}"`).join('+OR+');
        
        const response = await fetch(
          `${this.baseUrl}/search/issues?q=repo:${owner}/${repo}+${labelQuery}+state:open&sort=created&order=desc`,
          { headers: this.headers }
        );
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.items || [];
      } catch (error) {
        console.error('Error fetching beginner-friendly issues:', error);
        return [];
      }
    }
  
    /**
     *  context for AI analysis
     * @param {string} repoUrl 
     * @returns {Promise} 
     */
    async getProjectContextForAI(repoUrl) {
      const repoInfo = this.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        return {
          success: false,
          error: 'Invalid GitHub URL format'
        };
      }
      
      try {
        const { owner, repo } = repoInfo;
        
       
        const [repoDetails, readmeContent, contributingContent, beginnerIssues] = await Promise.all([
          this.getRepositoryDetails(owner, repo),
          this.getReadmeContent(owner, repo),
          this.getContributingContent(owner, repo),
          this.getBeginnerFriendlyIssues(owner, repo)
        ]);
        
        // Process issues
        const processedIssues = beginnerIssues.slice(0, 5).map(issue => ({
          number: issue.number,
          title: issue.title,
          url: issue.html_url,
          labels: issue.labels.map(label => label.name)
        }));
        
        return {
          success: true,
          repoDetails: {
            name: repoDetails.name,
            description: repoDetails.description,
            stars: repoDetails.stargazers_count,
            forks: repoDetails.forks_count,
            language: repoDetails.language,
            topics: repoDetails.topics || [],
            hasIssues: repoDetails.has_issues,
            url: repoDetails.html_url,
            homepage: repoDetails.homepage
          },
          readme: readmeContent ? {
            content: readmeContent.substring(0, 5000) // Limit size for API calls
          } : null,
          contributing: contributingContent ? {
            content: contributingContent.substring(0, 5000) // Limit size for API calls
          } : null,
          beginnerIssues: processedIssues
        };
      } catch (error) {
        console.error('Error getting project context:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }