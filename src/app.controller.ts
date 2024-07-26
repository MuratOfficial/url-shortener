import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from './redis.service';
import { ShortenUrlDto } from './shorten-url.dto';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly redisService: RedisService) {}

  @Post('shorten')
  async shorten(@Body() shortenUrlDto: ShortenUrlDto) {
    const { url } = shortenUrlDto;
    const code = uuidv4().slice(0, 6);
    await this.redisService.set(code, url);
    return {
      code,
      redirect: `${process.env.HOST || 'http://localhost:3000'}/${code}`,
    };
  }

  @Get(':shortcode')
  async redirect(@Param('shortcode') shortcode: string, @Res() res: Response) {
    const url = await this.redisService.get(shortcode);
    if (url) {
      return res.redirect(302, url);
    } else {
      throw new NotFoundException('Not found');
    }
  }
}
