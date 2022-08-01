import { Controller, Get, Res, Req, HttpStatus } from '@nestjs/common';
import axios from "axios";
import { AppService } from './app.service';

var accessToken;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/api/auth/github')
  async getUser(@Req() req, @Res() res) {
    const code = req.query.code;
    var gitHubToken;
    await axios
      .post(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`
      )
      .then((res) => {
        gitHubToken = res.data;
      })
      .catch((err) => {
        throw err;
      });

    process.env.GITHUB_ACCESS_TOKEN = gitHubToken.slice(13).split('&')[0];
    res.redirect("https://app.slack.com/client");
  }

  @Get('/exception')
  getException(): string {
    return this.appService.getException();
  }
}
