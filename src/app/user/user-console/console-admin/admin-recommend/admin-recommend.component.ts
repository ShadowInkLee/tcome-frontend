import {Component, OnInit} from '@angular/core'
import {Title} from '@angular/platform-browser'
import {Router} from '@angular/router'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {Observable} from 'rxjs/Observable'

import {Option} from './option'
import {List} from './list'
import {RecommendService} from './recommend.service'
import {StaticService} from '../../../../shared/service/static'

@Component({
    selector: 'app-admin-recommend',
    templateUrl: './admin-recommend.component.html',
    styleUrls: ['./admin-recommend.component.scss'],
    providers: [RecommendService]
})
export class AdminRecommendComponent implements OnInit {

    constructor (
        private recommendService: RecommendService,
        private staticService: StaticService,
        private titleService: Title,
        private router: Router
    ){
    }
    public option: Option
    public list: Observable<List[]>
    public showAlert: boolean = false

    private searchTerms = new BehaviorSubject<string>('allArticles')
    private timer: any


    getOption (){
        this.recommendService.getOption()
            .subscribe(
                option => this.option = option,
                error =>{
                    return this.staticService.toastyInfo(error.json().message);
                }
            )
    }
    changeOption (item: any){
        const arrayIndex = this.option.recommended.findIndex(v => v.id === item.id)
        if (arrayIndex >= 0) {
            this.option.recommended.splice(arrayIndex, 1)
        } else {
            if (this.option.recommended.length >= 5){
                return this.staticService.toastyInfo('最多只能添加5篇推荐文章', '添加失败')
            }
            this.option.recommended.push(item)
        }
        this.recommendService.changeOption(this.option)
            .subscribe(
                option => this.option = option,
                error =>{
                    return this.staticService.toastyInfo(error.json().message);
                }
            )
    }
    articleIsRecommended (item){
        return this.option.recommended.some(v => v.id === item.id)
    }

    search (keyWord: string){
        if (!keyWord) return this.searchTerms.next('allArticles')
        this.searchTerms.next(keyWord)
    }

    ngOnInit (){
        this.titleService.setTitle('推荐文章-维特博客')
        this.getOption()

        this.list = this.searchTerms
            .debounceTime(300)
            .distinctUntilChanged()
            .switchMap(word => this.recommendService.search(word))
            .catch(error => {
                return Observable.of<List[]>([]);
            })
    }

}
