import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms';
import { Userfeedback } from '../shared/userfeedback';
import { validateBasis } from '@angular/flex-layout';
import { Comment } from '../shared/Comment';
import {visibility} from '../animations/app.animation';
import { flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand()
    ]
})
export class DishdetailComponent implements OnInit {
  
  dishIds: string[];
  prev: string;
  next: string;
  dish: Dish;
  errMess: string;
  dishcopy: Dish;
  comment: Comment;
  commentForm: FormGroup;
  visibility = 'shown';

  @ViewChild('cform') commentFormDirective;

   formErrors={
    'author':'',
    'comment':''
   };

   validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },

    'comment': {
      'required':'Comments are required.' 
     }

  };
  
  
  constructor(private dishService: DishService,
    private route:ActivatedRoute,
    private location:Location, 
    private fb:FormBuilder,
    @Inject('BaseURL') private baseURL) { 
      }
 

    ngOnInit() {
      this.createForm();
      this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params
      .pipe(switchMap((params: Params) => {this.visibility='hidden'; return this.dishService.getDish(params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown';},
      errmess => this.errMess = <any>errmess);
       
        
    }
  
    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }
  
  goBack(): void {
    this.location.back();
  }

  createForm(){
this.commentForm=this.fb.group({

  author:['',[Validators.required,Validators.minLength(2)]],
  rating:5,
  comment:['',Validators.required]
   });
   this.commentForm.valueChanges
   .subscribe(data=>this.onValueChanged(data));

 this.onValueChanged(); // (re)set validation messages now

}
onValueChanged(data?: any) {
 if (!this.commentForm) { return; }
 const form = this.commentForm;
 for (const field in this.formErrors) {
   if (this.formErrors.hasOwnProperty(field)) {
     // clear previous error message (if any)
     this.formErrors[field] = '';
     const control = form.get(field);
     if (control && control.dirty && !control.valid) {
       const messages = this.validationMessages[field];
       for (const key in control.errors) {
         if (control.errors.hasOwnProperty(key)) {
           this.formErrors[field] += messages[key] + ' ';
         }
       }
     }
   }
 }
}


  onSubmit(){
    this.comment =this.commentForm.value;
    this.comment.date= new Date().toISOString();
    console.log(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    
    this.commentForm.reset({
      name:'',
      rating:5,
      comment:''
    });
    this.commentFormDirective.resetForm();
  }
}