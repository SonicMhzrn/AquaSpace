import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogPost } from '../../../core/models';
import { BlogService } from '../../../core/services/blog.service';
import { SeoService } from '../../../core/services/seo.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './blog-detail.component.html',
})
export class BlogDetailComponent implements OnInit {
  post?: BlogPost;
  related: BlogPost[] = [];

  constructor(private route: ActivatedRoute, private blogSvc: BlogService, private seo: SeoService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug')!;
      this.post = this.blogSvc.getBySlug(slug);
      if (this.post) {
        this.seo.update(this.post.title, this.post.description);
        this.related = this.blogSvc.getRelated(this.post);
      }
    });
  }
}
